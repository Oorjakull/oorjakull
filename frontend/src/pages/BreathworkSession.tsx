import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { BreathworkPhase, BreathworkProtocol } from '../api/client'

interface BreathworkSessionProps {
  protocol: BreathworkProtocol
  onExit: (toastMessage?: string) => void
}

function formatTime(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function heartZone(bpm: number) {
  if (bpm < 60) return 'Resting'
  if (bpm <= 80) return 'Relaxed'
  if (bpm <= 100) return 'Stimulated'
  return 'Elevated'
}

export default function BreathworkSession({ protocol, onExit }: BreathworkSessionProps) {
  const activePhases = useMemo(() => protocol.phases.filter((phase) => phase.duration_sec > 0), [protocol])
  const totalDurationMs = useMemo(
    () => activePhases.reduce((sum, phase) => sum + phase.duration_sec * 1000, 0) * protocol.cycles,
    [activePhases, protocol.cycles]
  )

  const [currentPhase, setCurrentPhase] = useState<BreathworkPhase>(activePhases[0])
  const [currentCycle, setCurrentCycle] = useState(1)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [displayBpm, setDisplayBpm] = useState(() => 72 + Math.floor(Math.random() * 12))
  const [temperature, setTemperature] = useState(() => 98.4 + Math.random() * 0.4)
  const [zoneBarA, setZoneBarA] = useState(52)
  const [zoneBarB, setZoneBarB] = useState(38)
  const [sessionComplete, setSessionComplete] = useState(false)

  const sessionStartRef = useRef<number>(Date.now())
  const phaseStartRef = useRef<number>(Date.now())
  const phaseDurationRef = useRef<number>((activePhases[0]?.duration_sec ?? 1) * 1000)
  const phaseTimeoutRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const hrIntervalRef = useRef<number | null>(null)
  const tempIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!activePhases.length) return

    let cancelled = false
    sessionStartRef.current = Date.now()
    setElapsedMs(0)
    setPhaseProgress(0)
    setSessionComplete(false)

    const runPhase = (cycleIndex: number, phaseIndex: number) => {
      if (cancelled) return
      if (cycleIndex >= protocol.cycles) {
        setSessionComplete(true)
        setElapsedMs(Date.now() - sessionStartRef.current)
        setPhaseProgress(1)
        return
      }

      const phase = activePhases[phaseIndex]
      setCurrentCycle(cycleIndex + 1)
      setCurrentPhase(phase)
      phaseStartRef.current = Date.now()
      phaseDurationRef.current = phase.duration_sec * 1000
      setPhaseProgress(0)

      if (phaseTimeoutRef.current) {
        window.clearTimeout(phaseTimeoutRef.current)
      }

      phaseTimeoutRef.current = window.setTimeout(() => {
        const nextPhaseIndex = phaseIndex + 1
        if (nextPhaseIndex >= activePhases.length) {
          runPhase(cycleIndex + 1, 0)
        } else {
          runPhase(cycleIndex, nextPhaseIndex)
        }
      }, phase.duration_sec * 1000)
    }

    const tick = () => {
      if (cancelled) return
      const now = Date.now()
      setElapsedMs(now - sessionStartRef.current)
      const duration = phaseDurationRef.current || 1
      const progress = Math.min(1, (now - phaseStartRef.current) / duration)
      setPhaseProgress(progress)
      rafRef.current = window.requestAnimationFrame(tick)
    }

    runPhase(0, 0)
    rafRef.current = window.requestAnimationFrame(tick)

    hrIntervalRef.current = window.setInterval(() => {
      setDisplayBpm((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3
        const next = Math.min(95, Math.max(72, prev + delta))
        return next
      })
      setZoneBarA(40 + Math.round(Math.random() * 42))
      setZoneBarB(26 + Math.round(Math.random() * 38))
    }, 5000)

    tempIntervalRef.current = window.setInterval(() => {
      setTemperature(98.4 + Math.random() * 0.5)
    }, 10000)

    return () => {
      cancelled = true
      if (phaseTimeoutRef.current) window.clearTimeout(phaseTimeoutRef.current)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      if (hrIntervalRef.current) window.clearInterval(hrIntervalRef.current)
      if (tempIntervalRef.current) window.clearInterval(tempIntervalRef.current)
    }
  }, [activePhases, protocol])

  const phaseDurationMs = (currentPhase?.duration_sec ?? 1) * 1000
  const phaseRemainingMs = Math.max(0, phaseDurationMs - phaseProgress * phaseDurationMs)
  const overallProgress = totalDurationMs > 0 ? Math.min(1, elapsedMs / totalDurationMs) : 0

  const animationFrameTime = Date.now()
  const holdPulse = currentPhase?.animation === 'hold' ? 1.3 + Math.sin(animationFrameTime / 300) * 0.02 : 1
  const logoScale = (() => {
    if (!currentPhase) return 1
    if (currentPhase.animation === 'expand') return 0.7 + phaseProgress * 0.6
    if (currentPhase.animation === 'contract') return 1.3 - phaseProgress * 0.6
    if (currentPhase.animation === 'pulse') return 1 + Math.sin(animationFrameTime / 180) * 0.1
    return holdPulse
  })()
  const glowOpacity = (() => {
    if (!currentPhase) return 0.25
    if (currentPhase.animation === 'expand') return 0.35 + phaseProgress * 0.35
    if (currentPhase.animation === 'contract') return 0.7 - phaseProgress * 0.4
    if (currentPhase.animation === 'pulse') return 0.4 + Math.abs(Math.sin(animationFrameTime / 200)) * 0.35
    return 0.55
  })()
  const glowColor = currentPhase?.animation === 'contract' ? '#2d1b69' : '#4ecdc4'
  const progressCircumference = 2 * Math.PI * 142
  const progressOffset = progressCircumference * (1 - phaseProgress)

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            'radial-gradient(circle at 50% 38%, rgba(78,205,196,0.16), transparent 26%), radial-gradient(circle at 50% 62%, rgba(45,27,105,0.2), transparent 34%)',
        }}
      />

      <div className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right text-sm backdrop-blur-xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Temperature</div>
        <div className="mt-1 font-semibold text-slate-100">{temperature.toFixed(1)}°F</div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <div className="text-3xl font-semibold tabular-nums text-white sm:text-4xl">{formatTime(elapsedMs)}</div>
          <div className="mt-1 text-sm tracking-[0.2em] text-slate-500 uppercase">
            Cycle {Math.min(currentCycle, protocol.cycles)} of {protocol.cycles}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <svg className="absolute h-[320px] w-[320px] -rotate-90" viewBox="0 0 320 320">
            <circle cx="160" cy="160" r="142" stroke="rgba(255,255,255,0.07)" strokeWidth="6" fill="none" />
            <circle
              cx="160"
              cy="160"
              r="142"
              stroke={glowColor}
              strokeWidth="7"
              fill="none"
              strokeDasharray={progressCircumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 120ms linear, stroke 280ms ease' }}
            />
          </svg>

          <div
            className="breathwork-pulse-ring absolute h-[310px] w-[310px] rounded-full border border-teal-300/25"
            style={{ animationPlayState: currentPhase?.animation === 'hold' ? 'paused' as const : 'running' as const }}
          />
          <div
            className="absolute h-[282px] w-[282px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${glowColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')} 0%, transparent 68%)`,
              filter: `blur(${26 + glowOpacity * 28}px)`,
              opacity: glowOpacity,
              transition: 'filter 280ms ease, opacity 280ms ease, background 280ms ease',
            }}
          />

          <div
            className="relative flex h-[260px] w-[260px] items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-[0_0_60px_rgba(0,0,0,0.45)]"
            style={{
              transform: `scale(${logoScale})`,
              transition: currentPhase?.animation === 'hold' ? 'none' : 'transform 120ms linear',
              boxShadow: `0 0 90px ${glowColor}55`,
            }}
          >
            <img src="/Logo.jpeg" alt="OorjaKull logo" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="mt-10 max-w-2xl text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentCycle}-${currentPhase.label}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-cinzel text-4xl font-semibold tracking-[0.08em] text-white sm:text-5xl">
                {currentPhase.label}
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                {currentPhase.instruction}
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">
                {formatTime(phaseRemainingMs)} remaining in this phase
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-24 left-4 z-20 w-[min(320px,calc(100%-2rem))] rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:left-6 sm:w-80">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">HR Zone</div>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-3xl font-semibold tabular-nums text-white">{displayBpm}</span>
              <span className="pb-1 text-xs text-slate-400">BPM</span>
            </div>
            <div className="mt-1 text-sm text-teal-200">{heartZone(displayBpm)}</div>
          </div>
          <div className="flex items-end gap-2 pt-2">
            <motion.div
              className="w-3 rounded-full bg-[#4ecdc4]"
              animate={{ height: `${zoneBarA}px` }}
              transition={{ duration: 2.6, ease: 'easeInOut' }}
            />
            <motion.div
              className="w-3 rounded-full bg-[#7ae5de]"
              animate={{ height: `${zoneBarB}px` }}
              transition={{ duration: 2.8, ease: 'easeInOut' }}
            />
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-500"
            animate={{ width: `${Math.max(12, overallProgress * 100)}%` }}
            transition={{ duration: 0.2, ease: 'linear' }}
          />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <button
          type="button"
          onClick={() => onExit('Session Complete')}
          className="rounded-full border border-red-400/30 bg-red-500/12 px-6 py-3 text-sm font-semibold text-red-200 backdrop-blur-xl transition hover:bg-red-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          End Session
        </button>
      </div>

      <AnimatePresence>
        {sessionComplete && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#101417]/92 p-8 text-center shadow-2xl backdrop-blur-xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400/30 to-indigo-500/25 text-3xl">
                ✨
              </div>
              <h2 className="mt-5 font-cinzel text-3xl font-semibold text-white">Session Complete</h2>
              <p className="mt-2 text-sm text-slate-400">{protocol.name}</p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total Time</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{formatTime(elapsedMs)}</p>
              </div>
              <p className="mt-6 text-sm leading-7 text-slate-300">
                Your nervous system thanks you. Stay with the softness you created and carry it into the rest of your day.
              </p>
              <button
                type="button"
                onClick={() => onExit('Session Complete')}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-black transition hover:from-teal-400 hover:to-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
