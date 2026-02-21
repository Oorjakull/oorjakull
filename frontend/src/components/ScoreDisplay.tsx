import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'

function scoreTone(score: number | null | undefined) {
  if (score === null || score === undefined) return 'text-slate-200'
  if (score >= 90) return 'text-emerald-200'
  if (score >= 70) return 'text-amber-200'
  return 'text-rose-200'
}

function barTone(score: number | null | undefined) {
  if (score === null || score === undefined) return 'from-white/12 to-white/6'
  if (score >= 90) return 'from-emerald-400/35 to-emerald-400/10'
  if (score >= 70) return 'from-amber-400/35 to-amber-400/10'
  return 'from-rose-400/35 to-rose-400/10'
}

export default memo(function ScoreDisplay(props: {
  score: number | null | undefined
  isAnalyzing: boolean
  variant?: 'full' | 'score' | 'bar'
}) {
  const variant = props.variant ?? 'full'

  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => Math.round(v))

  const [renderScore, setRenderScore] = useState(0)
  const lastTargetRef = useRef<number | null>(null)
  const [pulseKey, setPulseKey] = useState(0)

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setRenderScore(v))
    return () => unsub()
  }, [rounded])

  useEffect(() => {
    if (props.score === null || props.score === undefined) return

    const prev = lastTargetRef.current
    if (prev !== null && Math.abs(props.score - prev) <= 2) return

    const improving = prev !== null && props.score > prev
    lastTargetRef.current = props.score

    animate(mv, props.score, {
      duration: 0.85,
      ease: 'easeInOut'
    })

    if (improving) setPulseKey((k) => k + 1)
  }, [props.score, mv])

  const progress = useMemo(() => {
    if (props.score === null || props.score === undefined) return 0
    return Math.min(100, Math.max(0, props.score))
  }, [props.score])

  if (variant === 'score') {
    return (
      <motion.div
        key={pulseKey}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur"
      >
        <div className="text-[11px] text-slate-300">Score</div>
        <div className={'text-3xl font-medium tracking-tight leading-none ' + scoreTone(props.score)}>
          {props.score === null || props.score === undefined ? '—' : `${renderScore}`}
          <span className="text-xs text-slate-300">/100</span>
        </div>
        {props.isAnalyzing ? (
          <div className="text-[11px] text-slate-300">
            Analyzing
            <span className="anim-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        ) : null}
      </motion.div>
    )
  }

  if (variant === 'bar') {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur">
        <div className="h-2 rounded-2xl bg-white/5 overflow-hidden border border-white/10">
          <motion.div
            className={'h-full rounded-2xl bg-gradient-to-r ' + barTone(props.score)}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-200/80">
          <span>Needs work</span>
          <span>Excellent</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-6">
      <motion.div
        key={pulseKey}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="min-w-[160px]"
      >
        <div className="text-xs text-slate-300">Score</div>
        <div className={'text-4xl font-medium tracking-tight ' + scoreTone(props.score)}>
          {props.score === null || props.score === undefined ? '—' : `${renderScore}`}
          <span className="text-sm text-slate-300">/100</span>
        </div>
        {props.isAnalyzing ? (
          <div className="text-xs text-slate-300">
            Analyzing posture
            <span className="anim-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Stable update</div>
        )}
      </motion.div>

      <div className="flex-1">
        <div className="h-2 rounded-2xl bg-white/5 overflow-hidden border border-white/10">
          <motion.div
            className={'h-full rounded-2xl bg-gradient-to-r ' + barTone(props.score)}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>Needs work</span>
          <span>Excellent</span>
        </div>
      </div>
    </div>
  )
})
