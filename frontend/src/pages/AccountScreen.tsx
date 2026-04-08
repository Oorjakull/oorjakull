/**
 * AccountScreen — Settings page shown when the Account tab is active.
 * Contains: credit status, voice settings, theme toggle, sign-in/out.
 * All controls use the same handlers and state as their previous locations.
 */
import type { VoiceSettings as VoiceSettingsType } from '../hooks/useVoiceGuide'
import VoiceSettings from '../components/VoiceSettings'
import CreditIndicator from '../components/CreditIndicator'

interface AccountScreenProps {
  // Auth
  userName: string
  signedInWithGoogle: boolean
  onSignOut: () => void
  // Credits
  creditsRemaining: number | null
  creditsUsed?: number
  isUnlimited: boolean
  onShowUpgrade: () => void
  // Voice
  voiceOn: boolean
  onToggleVoice: (on: boolean) => void
  voiceSettings: VoiceSettingsType
  onChangeVoiceSettings: (s: VoiceSettingsType) => void
  onPreviewVoice: () => void
  // Theme
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const ROW = 'flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5'
const LABEL = 'text-sm font-medium text-slate-700 dark:text-slate-200'
const CAPTION = 'text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-1.5 mt-5 first:mt-0'

export default function AccountScreen(props: AccountScreenProps) {
  const {
    userName, signedInWithGoogle, onSignOut,
    creditsRemaining, creditsUsed, isUnlimited, onShowUpgrade,
    voiceOn, onToggleVoice, voiceSettings, onChangeVoiceSettings, onPreviewVoice,
    theme, onToggleTheme,
  } = props

  return (
    <div className="min-h-full overflow-y-auto pb-6">
      {/* ── Header ── */}
      <div className="px-4 pb-4 pt-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Account</h1>
        {userName && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {signedInWithGoogle ? `Signed in as ${userName}` : userName}
          </p>
        )}
      </div>

      <div className="px-4 space-y-1">

        {/* ── Credits ── */}
        <p className={CAPTION}>Credits</p>

        <div className={ROW}>
          <div>
            <p className={LABEL}>AI Feedback Credits</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Used for pose correction analysis
            </p>
          </div>
          <CreditIndicator
            creditsRemaining={creditsRemaining}
            creditsUsed={creditsUsed}
            isUnlimited={isUnlimited}
            variant="summary"
          />
        </div>

        {!isUnlimited && (
          <button
            type="button"
            onClick={onShowUpgrade}
            className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
          >
            Upgrade to Unlimited
            <span className="ml-2 text-xs font-normal opacity-70">Unlimited AI feedback</span>
          </button>
        )}

        {/* ── Voice ── */}
        <p className={CAPTION}>Voice</p>

        <div className={`${ROW} flex-col items-stretch gap-3`}>
          <p className={LABEL}>Voice Guide</p>
          <VoiceSettings
            voiceOn={voiceOn}
            onToggleVoice={onToggleVoice}
            settings={voiceSettings}
            onChangeSettings={onChangeVoiceSettings}
            onPreview={onPreviewVoice}
          />
        </div>

        {/* ── Appearance ── */}
        <p className={CAPTION}>Appearance</p>

        <div className={ROW}>
          <p className={LABEL}>Theme</p>
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {theme === 'dark'
                ? <><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>
                : <path d="M18 14.5A7.5 7.5 0 0 1 9.5 6a8.5 8.5 0 1 0 8.5 8.5Z"/>
              }
            </svg>
          </button>
        </div>

        {/* ── Account ── */}
        {signedInWithGoogle && (
          <>
            <p className={CAPTION}>Account</p>
            <button
              type="button"
              onClick={onSignOut}
              className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
            >
              Sign out
            </button>
          </>
        )}

      </div>
    </div>
  )
}
