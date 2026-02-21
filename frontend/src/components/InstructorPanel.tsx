import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExpectedPose, FocusArea, Severity } from '../api/client'
import { POSE_REFERENCES } from '../poses/reference'
import HighlightOverlay from './HighlightOverlay'

export default memo(function InstructorPanel(props: {
  baseUrl: string
  expectedPose: ExpectedPose
  primaryFocusArea: FocusArea
  severity: Severity | null
  alignedPulseActive: boolean
  alignedPulseKey: number
}) {
  const ref = POSE_REFERENCES.find((p) => p.pose === props.expectedPose)

  const mediaSrc = ref
    ? ref.kind === 'video'
      ? `${props.baseUrl}${ref.src}`
      : ref.src
    : ''

  return (
    <div className="min-h-0 h-full rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur flex flex-col">
      <div className="flex items-start justify-between gap-4 p-3">
        <div>
          <div className="text-xl font-medium tracking-tight text-slate-50">{props.expectedPose}</div>
          <div className="mt-1 text-xs text-slate-300">Instructor reference</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
          Highlight: <span className="capitalize">{props.primaryFocusArea.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 px-3 pb-3">
        <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <div className="relative h-full w-full">
            {ref?.kind === 'video' ? (
              <video
                src={mediaSrc}
                className="block h-full w-full select-none object-contain"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={mediaSrc}
                alt={`${props.expectedPose} reference`}
                className="block h-full w-full select-none object-contain"
                draggable={false}
              />
            )}

            <div className="pointer-events-none absolute inset-0">
              <HighlightOverlay focus={props.primaryFocusArea} severity={props.severity} />

              <AnimatePresence>
                {props.alignedPulseActive ? (
                  <motion.div
                    key={props.alignedPulseKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    className="absolute inset-2 rounded-2xl ring-2 ring-emerald-300/20"
                  />
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-3" />
      </div>
    </div>
  )
})
