import { useCallback, useEffect, useRef, useState } from 'react'

export function useThrottledState<T>(initial: T, maxHz: number) {
  const intervalMs = Math.max(1, Math.floor(1000 / maxHz))

  const [value, setValue] = useState<T>(initial)
  const lastSetTsRef = useRef<number>(0)
  const pendingRef = useRef<T | null>(null)
  const timerRef = useRef<number | null>(null)

  const setThrottled = useCallback(
    (next: T) => {
      const now = performance.now()
      const elapsed = now - lastSetTsRef.current

      if (elapsed >= intervalMs) {
        lastSetTsRef.current = now
        setValue(next)
        return
      }

      pendingRef.current = next
      if (timerRef.current) return

      const wait = Math.max(0, intervalMs - elapsed)
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        if (pendingRef.current !== null) {
          lastSetTsRef.current = performance.now()
          setValue(pendingRef.current)
          pendingRef.current = null
        }
      }, wait)
    },
    [intervalMs]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  return [value, setThrottled] as const
}
