import { useState } from 'react'
import type { VoiceSettings as VoiceSettingsType, VoiceGender, VoiceLanguageCode } from '../hooks/useVoiceGuide'

const LANGUAGES: Array<{ code: VoiceLanguageCode; label: string; short: string }> = [
  { code: 'en-IN', label: 'English',  short: 'EN'  },
  { code: 'hi-IN', label: 'Hindi',    short: 'हिं'  },
  { code: 'kn-IN', label: 'Kannada',  short: 'ಕನ'  },
  { code: 'bn-IN', label: 'Bengali',  short: 'বাং' },
  { code: 'mr-IN', label: 'Marathi',  short: 'मरा' },
  { code: 'gu-IN', label: 'Gujarati', short: 'ગુ'  },
]

export default function VoiceSettings(props: {
  voiceOn: boolean
  onToggleVoice: (on: boolean) => void
  settings: VoiceSettingsType
  onChangeSettings: (s: VoiceSettingsType) => void
  onPreview?: () => void
}) {
  const { voiceOn, onToggleVoice, settings, onChangeSettings, onPreview } = props
  const [openSettings, setOpenSettings] = useState(false)
  const [openLang, setOpenLang] = useState(false)

  const currentLang = LANGUAGES.find((l) => l.code === settings.languageCode) ?? LANGUAGES[0]

  const setGender = (g: VoiceGender) => onChangeSettings({ ...settings, gender: g })
  const setLanguage = (code: VoiceLanguageCode) => {
    onChangeSettings({ ...settings, languageCode: code })
    setOpenLang(false)
  }

  /* shared pill styles */
  const pillBase =
    'flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/80 px-2 py-1.5 text-xs text-slate-700 backdrop-blur transition-colors dark:border-white/10 dark:bg-white/5 dark:text-slate-200 sm:px-3 sm:py-2 sm:text-sm'
  const pillHover = 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white'

  return (
    <div className="relative z-20">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 sm:gap-2">

        {/* Voice toggle */}
        <label className={`${pillBase} cursor-pointer`}>
          <input
            type="checkbox"
            checked={voiceOn}
            onChange={(e) => onToggleVoice(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-white/20 bg-white/10 accent-emerald-500 sm:h-4 sm:w-4"
          />
          🔊 Voice
        </label>

        {/* Language quick-picker pill */}
        <div className="relative">
          <button
            type="button"
            title="Switch language"
            onClick={() => { setOpenLang((o) => !o); setOpenSettings(false) }}
            className={`${pillBase} ${pillHover} cursor-pointer font-medium`}
          >
            🌐
            <span className="tracking-wide">{currentLang.short}</span>
            <svg className="h-3 w-3 opacity-50" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 8L1 3h10z"/>
            </svg>
          </button>

          {/* Language popover */}
          {openLang && (
            <div className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-lg dark:border-white/10">
              {LANGUAGES.map((l) => {
                const active = l.code === settings.languageCode
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={
                      'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ' +
                      (active
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white')
                    }
                  >
                    <span className="w-6 text-center font-semibold">{l.short}</span>
                    <span>{l.label}</span>
                    {active && <span className="ml-auto text-[10px] opacity-80">✓</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Full settings gear */}
        <button
          type="button"
          onClick={() => { setOpenSettings((o) => !o); setOpenLang(false) }}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-600 backdrop-blur transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white sm:h-9 sm:w-9"
          title="Voice settings"
        >
          ⚙
        </button>
      </div>

      {/* ── Full settings panel ──────────────────────────────────────── */}
      {openSettings && (
        <div className="absolute right-0 top-12 z-50 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-slate-900/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-lg dark:border-white/10 sm:w-72">
          <h4 className="mb-3 text-sm font-semibold text-white">Voice Settings</h4>

          {/* Language — custom styled buttons, no native select */}
          <p className="mb-1.5 text-xs text-slate-400">Language</p>
          <div className="grid grid-cols-3 gap-1">
            {LANGUAGES.map((l) => {
              const active = l.code === settings.languageCode
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => onChangeSettings({ ...settings, languageCode: l.code })}
                  className={
                    'flex flex-col items-center rounded-xl px-2 py-2 text-center transition-colors ' +
                    (active
                      ? 'bg-emerald-600 text-white shadow shadow-emerald-900/40'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white')
                  }
                >
                  <span className="text-sm font-bold">{l.short}</span>
                  <span className="mt-0.5 text-[10px] leading-none opacity-80">{l.label}</span>
                </button>
              )
            })}
          </div>

          {/* Gender toggle */}
          <p className="mb-1.5 mt-3 text-xs text-slate-400">Voice</p>
          <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {(['female', 'male'] as VoiceGender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={
                  'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ' +
                  (settings.gender === g
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white')
                }
              >
                {g === 'female' ? '👩 Female' : '👨 Male'}
              </button>
            ))}
          </div>

          {/* Voice info */}
          <div className="mt-2 text-[11px] text-slate-500">
            Google TTS · {currentLang.label} · {settings.gender === 'female' ? 'Female' : 'Male'}
          </div>

          {/* Speed */}
          <label className="mt-3 block text-xs text-slate-400">
            Speed: {settings.rate.toFixed(2)}×
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.rate}
              onChange={(e) =>
                onChangeSettings({ ...settings, rate: parseFloat(e.target.value) })
              }
              className="mt-1 block w-full accent-emerald-500"
            />
            <span className="flex justify-between text-[10px] text-slate-500">
              <span>Slow</span>
              <span>Fast</span>
            </span>
          </label>

          {/* Pitch */}
          <label className="mt-3 block text-xs text-slate-400">
            Pitch: {settings.pitch.toFixed(2)}
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.pitch}
              onChange={(e) =>
                onChangeSettings({ ...settings, pitch: parseFloat(e.target.value) })
              }
              className="mt-1 block w-full accent-emerald-500"
            />
            <span className="flex justify-between text-[10px] text-slate-500">
              <span>Low</span>
              <span>High</span>
            </span>
          </label>

          {/* Volume */}
          <label className="mt-3 block text-xs text-slate-400">
            Volume: {Math.round(settings.volume * 100)}%
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) =>
                onChangeSettings({ ...settings, volume: parseFloat(e.target.value) })
              }
              className="mt-1 block w-full accent-emerald-500"
            />
          </label>

          {/* Preview + Close */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onPreview}
              disabled={!onPreview}
              className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              ▶ Preview
            </button>
            <button
              type="button"
              onClick={() => setOpenSettings(false)}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
