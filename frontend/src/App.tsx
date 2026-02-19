import { useEffect, useRef, useState } from 'react'
import type { AlignmentResponse, ExpectedPose, Landmark, Severity, UserLevel } from './api/client'
import { evaluateAlignment } from './api/client'
import LivePanel from './components/LivePanel'
import ReferencePanel from './components/ReferencePanel'
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
  const [visibilityMean, setVisibilityMean] = useState(1)
  const [hasEvaluated, setHasEvaluated] = useState(false)

  const [statusText, setStatusText] = useState('Press Start to evaluate once.')
  const [alignment, setAlignment] = useState<AlignmentResponse>({
    pose_match: 'partially_aligned',
    confidence: 'low',
    primary_focus_area: 'none',
    deviations: [],
    correction_message: 'Press Start to evaluate once.'
  })

  const clientIdRef = useRef<string>(newClientId())
  const lastSpokenRef = useRef<string>('')
  const lastSpeakTsRef = useRef<number>(0)

  const baseUrl = 'http://localhost:8000'

  const countdownTimerRef = useRef<number | null>(null)
  const latestLandmarksRef = useRef<Landmark[] | null>(null)
  const latestVisibilityRef = useRef<number>(0)
  const lastVisUiUpdateRef = useRef<number>(0)

  const severity: Severity | null = alignment.deviations.length
    ? worstSeverity(alignment.deviations)
    : null

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
    setHasEvaluated(false)
    setAlignment({
      pose_match: 'partially_aligned',
      confidence: 'low',
      primary_focus_area: 'none',
      deviations: [],
      correction_message: 'Hold the pose. We will evaluate once.'
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
      setHasEvaluated(true)
      setAlignment({
        pose_match: 'misaligned',
        confidence: 'low',
        primary_focus_area: 'none',
        deviations: [],
        correction_message: 'No pose detected yet. Press Start and hold the pose in view.'
      })
      setStatusText('No landmarks detected.')
      return
    }

    const visibilityMean = latestVisibilityRef.current
    if (visibilityMean < 0.5) {
      setHasEvaluated(true)
      setAlignment({
        pose_match: 'misaligned',
        confidence: 'low',
        primary_focus_area: 'none',
        deviations: [],
        correction_message: 'Ensure full body is visible.'
      })
      setStatusText('Paused: low visibility.')
      return
    }

    try {
      const resp = await evaluateAlignment({
        baseUrl,
        clientId: clientIdRef.current,
        expectedPose,
        userLevel,
        landmarks
      })
      setHasEvaluated(true)
      setAlignment(resp)
      setStatusText('Feedback ready.')
    } catch (e) {
      setHasEvaluated(true)
      setAlignment((prev) => ({
        ...prev,
        confidence: 'low',
        correction_message: 'Backend unavailable.'
      }))
      setStatusText('Backend unavailable.')
    }
  }

  const analyzingIndicator = running
    ? 'Hold pose (dots updating)'
    : 'One-time check complete (press Start to re-check)'

  const liveStatusText =
    countdown > 0 && visibilityMean < 0.5 ? 'Hold steady… full body in frame.' : statusText

  return (
    <div className="app">
      <div className="main">
        <ReferencePanel
          expectedPose={expectedPose}
          primaryFocusArea={alignment.primary_focus_area}
          severity={severity}
        />
        <LivePanel
          running={running}
          countdown={countdown}
          statusText={liveStatusText}
          onLandmarks={(lms, visMean) => {
            latestLandmarksRef.current = lms
            latestVisibilityRef.current = visMean

            // Throttle UI updates to avoid re-rendering on every video frame.
            const now = performance.now()
            if (now - lastVisUiUpdateRef.current > 200) {
              lastVisUiUpdateRef.current = now
              setVisibilityMean(visMean)
            }
          }}
        />
      </div>

      <div className="bottomBar">
        <div className="correction">
          <div style={{ fontWeight: 650, whiteSpace: 'pre-wrap' }}>{alignment.correction_message}</div>

          {hasEvaluated && alignment.deviations.length ? (
            <div className="small" style={{ display: 'grid', gap: 2 }}>
              {alignment.deviations.slice(0, 4).map((d, idx) => (
                <div key={idx}>
                  • {d.joint_or_area}: {d.issue} ({d.severity})
                </div>
              ))}
            </div>
          ) : null}
          <div className="small">
            {hasEvaluated ? (
              <>
                Confidence: {alignment.confidence} · Match: {alignment.pose_match} · {analyzingIndicator}
              </>
            ) : (
              <>Waiting for evaluation · {analyzingIndicator}</>
            )}
          </div>
        </div>
        <div className="controls">
          <select
            value={expectedPose}
            onChange={(e) => {
              setExpectedPose(e.target.value as ExpectedPose)
              setHasEvaluated(false)
              stopSession()
              setAlignment({
                pose_match: 'partially_aligned',
                confidence: 'low',
                primary_focus_area: 'none',
                deviations: [],
                correction_message: 'Press Start to evaluate once.'
              })
              setStatusText('Press Start to evaluate once.')
            }}
          >
            {POSE_REFERENCES.map((p) => (
              <option key={p.pose} value={p.pose}>
                {p.pose}
              </option>
            ))}
          </select>

          <button onClick={() => (running ? stopSession() : startSession())}>
            {running ? 'Pause' : 'Start'}
          </button>

          <label className="small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={voiceOn} onChange={(e) => setVoiceOn(e.target.checked)} />
            Voice
          </label>
        </div>
      </div>
    </div>
  )
}
