/**
 * BottomNav — Fixed bottom navigation bar (4 tabs).
 * Visible only on the 'landing' phase. Uses inline SVG icons matching
 * the existing BreathworkIcons stroke style.
 */

interface BottomNavProps {
  activeTab: 'yoga' | 'breathwork' | 'account'
  onChangeTab: (tab: 'yoga' | 'breathwork' | 'account') => void
}

/* ── SVG icons (single-color, stroke-based, matching BreathworkIcons.tsx) ── */

function YogaIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
      strokeWidth={active ? '2' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
      {/* person in tree pose */}
      <circle cx="12" cy="4" r="1.8" />
      <path d="M12 8v7" />
      <path d="M8 21l4-6 4 6" />
      <path d="M7 13l5-2 5 2" />
    </svg>
  )
}

function BreathIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
      strokeWidth={active ? '2' : '1.8'} strokeLinecap="round">
      <path d="M2 12c2.4 0 2.4-4 4.8-4s2.4 4 4.8 4 2.4-4 4.8-4 2.4 4 4.8 4" />
      <path d="M2 16c2.4 0 2.4-4 4.8-4s2.4 4 4.8 4 2.4-4 4.8-4 2.4 4 4.8 4" opacity="0.65" />
    </svg>
  )
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
      strokeWidth={active ? '2' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  )
}

const TABS: Array<{
  key: BottomNavProps['activeTab']
  label: string
  Icon: (p: { active: boolean }) => JSX.Element
}> = [
  { key: 'yoga',       label: 'Yoga',    Icon: YogaIcon },
  { key: 'breathwork', label: 'Breathe', Icon: BreathIcon },
  { key: 'account',    label: 'Account', Icon: AccountIcon },
]

export default function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-slate-200/80 bg-white/95 backdrop-blur-lg dark:border-white/10 dark:bg-slate-950/95"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {TABS.map(({ key, label, Icon }) => {
          const active = activeTab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChangeTab(key)}
              className={
                'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ' +
                (active
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300')
              }
            >
              <Icon active={active} />
              <span className={`text-[10px] font-semibold leading-tight ${active ? '' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
