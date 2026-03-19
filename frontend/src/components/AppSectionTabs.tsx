interface AppSectionTabsProps {
  value: 'yoga' | 'breathwork'
  onChange: (value: 'yoga' | 'breathwork') => void
}

export default function AppSectionTabs({ value, onChange }: AppSectionTabsProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
      <button
        type="button"
        onClick={() => onChange('yoga')}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          value === 'yoga'
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
        }`}
      >
        Yoga
      </button>
      <button
        type="button"
        onClick={() => onChange('breathwork')}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
          value === 'breathwork'
            ? 'bg-teal-500 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
        }`}
      >
        Breathwork
      </button>
    </div>
  )
}
