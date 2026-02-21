import { useEffect, useRef, useState } from 'react'

export function useDelayedValue<T>(value: T, delayMs: number): T {
  const [delayed, setDelayed] = useState<T>(value)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setDelayed(value)
      timerRef.current = null
    }, delayMs)

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [value, delayMs])

  return delayed
}
