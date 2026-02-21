import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDelayedValue } from '../hooks/useDelayedValue'

export default memo(function FeedbackPanel(props: { message: string }) {
  const msg = useDelayedValue(props.message, 150)

  return (
    <div className="rounded-2xl bg-black/30 border border-white/10 p-3 backdrop-blur">
      <div className="text-xs text-slate-300 mb-1">Instructor feedback</div>
      <div className="min-h-[2.6rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={msg}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="whitespace-pre-wrap text-sm text-slate-50 leading-snug"
            aria-live="polite"
          >
            {msg}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
})
