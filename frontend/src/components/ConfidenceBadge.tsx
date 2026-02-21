import { memo } from 'react'
import type { AlignmentResponse } from '../api/client'

function tone(conf: AlignmentResponse['confidence']) {
  switch (conf) {
    case 'high':
      return 'bg-emerald-400/15 text-emerald-200 border-emerald-400/20'
    case 'medium':
      return 'bg-amber-400/15 text-amber-200 border-amber-400/20'
    case 'low':
      return 'bg-white/8 text-slate-200 border-white/10'
  }
}

export default memo(function ConfidenceBadge(props: { confidence: AlignmentResponse['confidence'] }) {
  return (
    <div
      aria-label={`Confidence ${props.confidence}`}
      className={
        'pointer-events-none inline-flex items-center gap-2 rounded-2xl border px-3 py-1 text-xs tracking-wide backdrop-blur ' +
        tone(props.confidence)
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      <span className="capitalize">{props.confidence} confidence</span>
    </div>
  )
})
