import { memo, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { FocusArea, Severity } from '../api/client'

function focusToIds(focus: FocusArea): string[] {
  switch (focus) {
    case 'front_knee':
      return ['front_knee']
    case 'back_leg':
      return ['back_leg']
    case 'arms':
      return ['arms']
    case 'torso':
      return ['torso']
    case 'hips':
      return ['hips']
    case 'balance':
      return ['full_body']
    case 'none':
      return []
  }
}

function severityTone(sev: Severity | null) {
  if (!sev) return 'text-white/0'
  switch (sev) {
    case 'minor':
      return 'text-amber-200'
    case 'moderate':
      return 'text-orange-200'
    case 'major':
      return 'text-rose-200'
  }
}

export default memo(function HighlightOverlay(props: {
  focus: FocusArea
  severity: Severity | null
}) {
  const ids = useMemo(() => focusToIds(props.focus), [props.focus])
  const tone = severityTone(props.severity)

  const on = ids.length > 0 && props.severity !== null

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <AnimatePresence>
        {on ? (
          <motion.g
            key={`${props.focus}:${props.severity}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className={tone}
          >
            <path
              className={'fill-none svg-glow ' + (ids.includes('full_body') ? '' : 'opacity-0')}
              stroke="currentColor"
              strokeWidth="6"
              d="M20,8 L80,8 L80,98 L20,98 Z"
            />
            <path
              className={'fill-none svg-glow ' + (ids.includes('arms') ? '' : 'opacity-0')}
              stroke="currentColor"
              strokeWidth="6"
              d="M10,35 L90,35"
            />
            <path
              className={'fill-none svg-glow ' + (ids.includes('torso') ? '' : 'opacity-0')}
              stroke="currentColor"
              strokeWidth="6"
              d="M50,22 L50,62"
            />
            <path
              className={'fill-none svg-glow ' + (ids.includes('hips') ? '' : 'opacity-0')}
              stroke="currentColor"
              strokeWidth="6"
              d="M35,62 L65,62"
            />
            <path
              className={'fill-none svg-glow ' + (ids.includes('front_knee') ? '' : 'opacity-0')}
              stroke="currentColor"
              strokeWidth="6"
              d="M43,78 L43,86"
            />
            <path
              className={'fill-none svg-glow ' + (ids.includes('back_leg') ? '' : 'opacity-0')}
              stroke="currentColor"
              strokeWidth="6"
              d="M57,62 L60,96"
            />
          </motion.g>
        ) : null}
      </AnimatePresence>
    </svg>
  )
})
