/**
 * AccountScreen — Account page with three tabs:
 *   Profile  — aggregate metrics (yoga hours, sessions, avg score) + health profile edit button
 *   History  — list of past sessions with pose scores
 *   Settings — credits, voice, theme, sign-out (moved from root)
 */
import { useEffect, useState } from 'react'
import type { VoiceSettings as VoiceSettingsType } from '../hooks/useVoiceGuide'
import VoiceSettings from '../components/VoiceSettings'
import CreditIndicator from '../components/CreditIndicator'
import type { UserProgression, UserSessionRecord } from '../api/client'
import { fetchUserProgression, fetchUserSessions } from '../api/client'

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
  // New: session history + health profile
  googleSub: string
  baseUrl: string
  onEditHealthProfile: () => void
}

const ROW = 'flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5'
const LABEL = 'text-sm font-medium text-slate-700 dark:text-slate-200'
const CAPTION = 'text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-1.5 mt-5 first:mt-0'

type Tab = 'profile' | 'history' | 'settings'

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AccountScreen(props: AccountScreenProps) {
  const {
    userName, signedInWithGoogle, onSignOut,
    creditsRemaining, creditsUsed, isUnlimited, onShowUpgrade,
    voiceOn, onToggleVoice, voiceSettings, onChangeVoiceSettings, onPreviewVoice,
    theme, onToggleTheme,
    googleSub, baseUrl, onEditHealthProfile,
  } = props

  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [progression, setProgression] = useState<UserProgression | null>(null)
  const [sessions, setSessions] = useState<UserSessionRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  // Load progression metrics on mount (for Profile tab)
  useEffect(() => {
    if (!googleSub) return
    fetchUserProgression({ baseUrl, googleSub })
      .then(setProgression)
      .catch(() => {})
  }, [googleSub, baseUrl])

  // Load history lazily when History tab is first opened
  useEffect(() => {
    if (activeTab !== 'history' || historyLoaded || !googleSub) return
    setHistoryLoading(true)
    fetchUserSessions({ baseUrl, googleSub })
      .then((data) => { setSessions(data); setHistoryLoaded(true) })
      .catch(() => { setHistoryLoaded(true) })
      .finally(() => setHistoryLoading(false))
  }, [activeTab, historyLoaded, googleSub, baseUrl])

  // Derived metrics
  const yogaHours = progression ? Math.floor(progression.total_practice_minutes / 60) : 0
  const yogaMins = progression ? progression.total_practice_minutes % 60 : 0
  const totalSessions = progression?.total_sessions ?? 0
  const poseStats = progression?.pose_stats ?? {}
  const allBestScores = Object.values(poseStats).map((s) => s.best_score).filter((s) => s > 0)
  const avgScore = allBestScores.length > 0
    ? Math.round(allBestScores.reduce((a, b) => a + b, 0) / allBestScores.length)
    : 0

  return (
    <div className="min-h-full overflow-y-auto pb-6">
      {/* ── Header ── */}
      <div className="px-4 pb-3 pt-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Account</h1>
        {userName && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {signedInWithGoogle ? `Signed in as ${userName}` : userName}
          </p>
        )}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1 px-4 pb-3">
        {(['profile', 'history', 'settings'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl py-1.5 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/8 dark:text-slate-300 dark:hover:bg-white/12'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <div className="px-4 space-y-1">
          <p className={CAPTION}>Practice Summary</p>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5 px-3 py-4 text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {yogaHours > 0 ? `${yogaHours}h` : yogaMins > 0 ? `${yogaMins}m` : '0m'}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Yoga Time</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5 px-3 py-4 text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalSessions}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Sessions</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5 px-3 py-4 text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{avgScore > 0 ? `${avgScore}` : '—'}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Avg Score</p>
            </div>
          </div>

          {/* Pose breakdown */}
          {Object.keys(poseStats).length > 0 && (
            <>
              <p className={CAPTION}>Pose Performance</p>
              <div className="space-y-1">
                {Object.entries(poseStats).map(([pose, stats]) => (
                  <div key={pose} className={`${ROW}`}>
                    <div>
                      <p className={LABEL}>{pose}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {stats.attempts} attempt{stats.attempts !== 1 ? 's' : ''} · {stats.completions} completed
                      </p>
                    </div>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.best_score > 0 ? stats.best_score : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Health profile edit */}
          <p className={CAPTION}>Health Profile</p>
          <button
            type="button"
            onClick={onEditHealthProfile}
            className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Edit Health Profile
            <span className="ml-2 text-xs font-normal opacity-60">Update your health questionnaire</span>
          </button>
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === 'history' && (
        <div className="px-4 space-y-1">
          <p className={CAPTION}>Session History</p>

          {historyLoading && (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Loading…</div>
          )}

          {!historyLoading && sessions.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              No completed sessions yet. Finish a pose session to see your history here.
            </div>
          )}

          {!historyLoading && sessions.map((session) => (
            <div key={session.session_id} className="rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatDate(session.ended_at)}
                </p>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {formatDuration(session.duration_seconds)}
                </span>
              </div>
              {session.poses.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {session.poses.map((attempt, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300"
                    >
                      {attempt.pose_id}
                      {attempt.peak_score != null && (
                        <span className="font-bold">{attempt.peak_score}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Settings Tab ── */}
      {activeTab === 'settings' && (
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
      )}
    </div>
  )
}
