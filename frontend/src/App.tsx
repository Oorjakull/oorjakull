import { useEffect, useRef, useState } from 'react'
import type { AlignmentResponse, ExpectedPose, Landmark, Severity, UserLevel } from './api/client'
import { evaluateAlignment } from './api/client'
import InstructorPanel from './components/InstructorPanel'
import LayoutToggle, { type LayoutMode } from './components/LayoutToggle'
import UserCameraPanel from './components/UserCameraPanel'
import { useThrottledState } from './hooks/useThrottledState'
import { POSE_REFERENCES, worstSeverity } from './poses/reference'

function newClientId(): string {
  return crypto.randomUUID?.() ?? String(Date.now())
}

export default function App() {
  const [expectedPose, setExpectedPose] = useState<ExpectedPose>('Warrior II')
  const [userLevel] = useState<UserLevel>('beginner')
  const [running, setRunning] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [voiceOn, setVoiceOn] = useState(false)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('laptop')
  const [evaluating, setEvaluating] = useState(false)

  const [statusText, setStatusText] = useState('Press Start to evaluate once.')

  const [alignment, setAlignment] = useThrottledState<AlignmentResponse>(
    {
    pose_match: 'partially_aligned',
    confidence: 'low',
    primary_focus_area: 'none',
    deviations: [],
    correction_message: 'Press Start to evaluate once.',
    score: null
    },
    2
  )

  const clientIdRef = useRef<string>(newClientId())
  const lastSpokenRef = useRef<string>('')
  const lastSpeakTsRef = useRef<number>(0)

  const baseUrl = 'http://localhost:8000'

  const countdownTimerRef = useRef<number | null>(null)
  const latestLandmarksRef = useRef<Landmark[] | null>(null)
  const latestVisibilityRef = useRef<number>(0)
  const alignedPulseTimerRef = useRef<number | null>(null)
  const [alignedPulseActive, setAlignedPulseActive] = useState(false)
  const [alignedPulseKey, setAlignedPulseKey] = useState(0)

  const severity: Severity | null = alignment.deviations.length
    ? worstSeverity(alignment.deviations)
    : null

  const isAnalyzing = running || evaluating

  const pageLayoutClass =
    layoutMode === 'laptop'
      ? 'grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2'
      : 'flex min-h-0 flex-1 flex-col gap-3'

  const deviceFrame =
    layoutMode === 'mobile'
      ? 'mx-auto flex h-full w-full max-w-[440px] flex-col rounded-[32px] border border-white/10 bg-black/20 p-3 shadow-2xl shadow-black/40'
      : 'flex h-full flex-col'

  useEffect(() => {
    if (!voiceOn) return
    const msg = alignment.correction_message
    const now = Date.now()
    if (!msg || msg === lastSpokenRef.current) return
    if (now - lastSpeakTsRef.current < 2000) return

    const u = new SpeechSynthesisUtterance(msg)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)

    lastSpokenRef.current = msg
    lastSpeakTsRef.current = now
  }, [alignment.correction_message, voiceOn])

  function startSession() {
    clientIdRef.current = newClientId()
    setAlignment({
      pose_match: 'partially_aligned',
      confidence: 'low',
      primary_focus_area: 'none',
      deviations: [],
      correction_message: 'Hold the pose. We will evaluate once.',
      score: null
    })

    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }

    setCountdown(3)
    setRunning(true)
    setStatusText('Hold the pose. Evaluating in 3…')

    const t = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(t)
          countdownTimerRef.current = null
          setStatusText('Evaluating… (one-time)')
          window.setTimeout(() => {
            void doEvaluate().finally(() => {
              setRunning(false)
              setStatusText('Feedback ready.')
            })
          }, 250)
          return 0
        }
        setStatusText(`Hold the pose. Evaluating in ${c - 1}…`)
        return c - 1
      })
    }, 1000)

    countdownTimerRef.current = t
  }

  function stopSession() {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    setCountdown(0)
    setRunning(false)
    setStatusText('Paused.')
  }

  async function doEvaluate() {
    const landmarks = latestLandmarksRef.current
    if (!landmarks) {
      setAlignment({
        pose_match: 'misaligned',
        confidence: 'low',
        primary_focus_area: 'none',
        deviations: [],
        correction_message: 'No pose detected yet. Press Start and hold the pose in view.',
        score: null
      })
      setStatusText('No landmarks detected.')
      return
    }

    const visibilityMean = latestVisibilityRef.current
    if (visibilityMean < 0.5) {
      setAlignment({
        pose_match: 'misaligned',
        confidence: 'low',
        primary_focus_area: 'none',
        deviations: [],
        correction_message: 'Ensure full body is visible.',
        score: null
      })
      setStatusText('Paused: low visibility.')
      return
    }

    try {
      setEvaluating(true)
      setStatusText('Analyzing posture…')
      const resp = await evaluateAlignment({
        baseUrl,
        clientId: clientIdRef.current,
        expectedPose,
        userLevel,
        landmarks
      })
      setAlignment(resp)
      setStatusText('Feedback ready.')

      const alignedNow = resp.pose_match === 'aligned' && resp.primary_focus_area === 'none'
      if (alignedNow) {
        if (alignedPulseTimerRef.current) window.clearTimeout(alignedPulseTimerRef.current)
        setAlignedPulseActive(true)
        setAlignedPulseKey((k) => k + 1)
        alignedPulseTimerRef.current = window.setTimeout(() => {
          setAlignedPulseActive(false)
          alignedPulseTimerRef.current = null
        }, 750)
      }
    } catch (e) {
      setAlignment({
        ...alignment,
        confidence: 'low',
        correction_message: 'Backend unavailable.',
        score: null
      })
      setStatusText('Backend unavailable.')
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-neutral-950 text-slate-50">
      <div className="mx-auto flex h-full max-w-6xl flex-col px-3 py-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-medium tracking-tight">OorjaKull AI Yoga</div>
            <div className="mt-1 text-sm text-slate-300"></div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LayoutToggle mode={layoutMode} onChange={setLayoutMode} />

            <select
              aria-label="Expected pose"
              value={expectedPose}
              onChange={(e) => {
                setExpectedPose(e.target.value as ExpectedPose)
                stopSession()
                setAlignment({
                  pose_match: 'partially_aligned',
                  confidence: 'low',
                  primary_focus_area: 'none',
                  deviations: [],
                  correction_message: 'Press Start to evaluate once.',
                  score: null
                })
                setStatusText('Press Start to evaluate once.')
              }}
              className="h-10 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            >
              {POSE_REFERENCES.map((p) => (
                <option key={p.pose} value={p.pose} className="text-slate-900">
                  {p.pose}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => (running ? stopSession() : startSession())}
              className="h-10 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white transition-colors duration-300 ease-in-out hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            >
              {running ? 'Pause' : 'Start'}
            </button>

            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={voiceOn}
                onChange={(e) => setVoiceOn(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10"
              />
              Voice
            </label>
          </div>
        </div>

        <div className={`${deviceFrame} flex-1 min-h-0`}>
          <div className={`${pageLayoutClass} min-h-0 flex-1`}>
            <InstructorPanel
              baseUrl={baseUrl}
              expectedPose={expectedPose}
              primaryFocusArea={alignment.primary_focus_area}
              severity={severity}
              alignedPulseActive={alignedPulseActive}
              alignedPulseKey={alignedPulseKey}
            />
            <UserCameraPanel
              running={running}
              countdown={countdown}
              statusText={statusText}
              confidence={alignment.confidence}
              score={alignment.score}
              isAnalyzing={isAnalyzing}
              feedbackMessage={alignment.correction_message}
              onLandmarks={(lms, visMean) => {
                latestLandmarksRef.current = lms
                latestVisibilityRef.current = visMean
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
