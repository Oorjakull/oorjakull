import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { AlignmentResponse, Landmark } from '../api/client'
import { usePoseLandmarker } from '../hooks/usePoseLandmarker'
import ConfidenceBadge from './ConfidenceBadge'
import FeedbackPanel from './FeedbackPanel'
import ScoreDisplay from './ScoreDisplay'
import { AnimatePresence, motion } from 'framer-motion'

function drawSkeleton(params: {
  canvas: HTMLCanvasElement
  landmarks: Landmark[]
  displayWidth: number
  displayHeight: number
  videoWidth: number
  videoHeight: number
  objectFit?: 'cover' | 'contain'
}) {
  const { canvas, landmarks, displayWidth, displayHeight, videoWidth, videoHeight, objectFit = 'contain' } = params
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = displayWidth
  const h = displayHeight

  // Use the appropriate scale depending on object-fit mode.
  const scale = objectFit === 'contain'
    ? Math.min(w / videoWidth, h / videoHeight)
    : Math.max(w / videoWidth, h / videoHeight)
  const drawnW = videoWidth * scale
  const drawnH = videoHeight * scale
  const offsetX = (w - drawnW) / 2
  const offsetY = (h - drawnH) / 2

  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  for (const lm of landmarks) {
    const x = offsetX + lm.x * drawnW
    const y = offsetY + lm.y * drawnH
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default memo(function UserCameraPanel(props: {
  running: boolean
  countdown: number
  statusText: string
  confidence: AlignmentResponse['confidence']
  score: number | null | undefined
  isAnalyzing: boolean
  feedbackMessage: string
  correctionBullets?: string[]
  positiveObservation?: string
  breathCue?: string
  safetyNote?: string | null
  onLandmarks: (landmarks: Landmark[], visibilityMean: number) => void
  framingEnabled: boolean
  framingState: 'cameraLoading' | 'notFramed' | 'partiallyFramed' | 'handsNotRaised' | 'fullyFramed'
  framingMessage: string
  isPortrait?: boolean
  fullScreen?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const fitModeRef = useRef<'cover' | 'contain'>('cover')

  const { ready, error, getLandmarksFromVideo } = usePoseLandmarker()
  const [streamError, setStreamError] = useState<string | null>(null)

  const badge = useMemo(() => <ConfidenceBadge confidence={props.confidence} />, [props.confidence])

  useEffect(() => {
    let stream: MediaStream | null = null

    async function start() {
      try {
        // Build constraints — portrait vs landscape resolution
        const baseConstraints = (facing: MediaTrackConstraints['facingMode']): MediaTrackConstraints => props.isPortrait
          ? {
              facingMode: facing,
              width: { ideal: 720, max: 1080 },
              height: { ideal: 1280, max: 1920 },
              aspectRatio: { ideal: 9 / 16 },
              advanced: [{ zoom: 1.0 } as any, { focusMode: 'continuous' } as any],
            }
          : {
              facingMode: facing,
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              aspectRatio: { ideal: 16 / 9 },
              advanced: [{ zoom: 1.0 } as any, { focusMode: 'continuous' } as any],
            }

        // Try exact:'user' first; fall back to plain 'user' if OverconstrainedError
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: baseConstraints({ exact: 'user' }),
            audio: false,
          })
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: baseConstraints('user'),
            audio: false,
          })
        }

        // Android WebView zoom fix — forces zoom to hardware minimum if Camera2 exposes it
        const track = stream.getVideoTracks()[0]
        if (track) {
          const capabilities = (track as any).getCapabilities?.()
          if (capabilities?.zoom) {
            await track.applyConstraints({
              advanced: [{ zoom: capabilities.zoom.min } as any],
            }).catch(() => undefined)
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          // Some browsers can reject autoplay even when muted; don't treat that as camera failure.
          videoRef.current.play().catch(() => undefined)
        }
      } catch {
        setStreamError('Camera unavailable.')
      }
    }

    start()

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [props.isPortrait])

  useEffect(() => {
    let raf = 0
    let lastLandmarksTs = 0

    const tick = async () => {
      try {
        if (videoRef.current && canvasRef.current && ready) {
          const video = videoRef.current
          const canvas = canvasRef.current

          const stage = stageRef.current
          if (!stage || !video.videoWidth || !video.videoHeight) {
            raf = requestAnimationFrame(tick)
            return
          }

          const rect = stage.getBoundingClientRect()
          const displayWidth = Math.max(1, Math.round(rect.width))
          const displayHeight = Math.max(1, Math.round(rect.height))

          // Match canvas internal resolution to CSS pixels * DPR so drawings stay sharp.
          const dpr = window.devicePixelRatio || 1
          const targetW = Math.max(1, Math.round(displayWidth * dpr))
          const targetH = Math.max(1, Math.round(displayHeight * dpr))
          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW
            canvas.height = targetH
          }

          const ctx = canvas.getContext('2d')
          if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

          // Performance: evaluate framing at max 2Hz.
          const now = performance.now()
          if (now - lastLandmarksTs >= 500) {
            lastLandmarksTs = now

            const landmarks = await getLandmarksFromVideo(video)
            if (landmarks && landmarks.length === 33) {
              drawSkeleton({
                canvas,
                landmarks,
                displayWidth,
                displayHeight,
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                objectFit: fitModeRef.current,
              })
              const visibilityMean = landmarks.reduce((a, l) => a + l.visibility, 0) / landmarks.length
              props.onLandmarks(landmarks, visibilityMean)
            }
          }
        }
      } catch {
        // MediaPipe or canvas error — swallow to keep the frame loop alive
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [props.running, ready, getLandmarksFromVideo, props.onLandmarks])

  const headerBadge = ready ? 'MediaPipe ready' : 'Loading…'
  // Always cover: fills edge-to-edge with no black bars.
  // The camera zoom fix (v1.0.4) ensures adequate FOV so the full body is visible.
  const fitMode = 'cover' as const
  fitModeRef.current = fitMode
  const framed = props.framingState === 'fullyFramed'
  const frameTone = framed ? 'text-emerald-200' : 'text-amber-200'
  const framePulse = framed ? '' : 'calib-pulse'

  return (
    <div className={`min-h-0 h-full ${props.fullScreen ? 'bg-black' : 'rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur'} flex flex-col`}>
      {/* Header — hidden in portrait-mobile to maximize camera space */}
      {!props.isPortrait && (
        <div className="flex items-start justify-between gap-4 p-3">
          <div>
            <div className="text-xl font-medium tracking-tight text-slate-50">Your camera</div>
            <div className="mt-1 text-xs text-slate-300">Live feed + skeleton</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
            {headerBadge}
          </div>
        </div>
      )}

      <div className={`min-h-0 flex-1 ${props.isPortrait ? '' : 'px-3 pb-3'}`}>
        <div className={`relative h-full overflow-hidden shadow-xl shadow-black/30 ${props.isPortrait ? '' : 'rounded-2xl border border-white/10'}`} style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 100%)' }}>
          <div ref={stageRef} className="relative h-full w-full">
            <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 h-full w-full object-${fitMode}`} />
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

            <div className="pointer-events-none absolute inset-0 p-3">
              {props.framingEnabled ? (
                <div
                  className={
                    `h-full w-full rounded-2xl ring-2 transition-all duration-500 ease-in-out calib-glow ${frameTone} ` +
                    (framed ? 'ring-emerald-300/50' : 'ring-amber-300/55 ') +
                    framePulse
                  }
                />
              ) : null}
            </div>

            {props.framingEnabled ? (
              <div className="pointer-events-none absolute inset-0 grid place-items-center px-4 sm:px-6">
                <div className="w-full max-w-[560px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={props.framingState + ':' + props.framingMessage}
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 2 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold text-slate-50 backdrop-blur text-center xs:px-4 xs:py-2.5 xs:text-sm sm:px-5 sm:py-4 sm:text-base"
                    >
                      {props.framingMessage}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            ) : null}

            <div className="pointer-events-none absolute right-2 top-2 camera-hud-stack flex flex-col items-end xs:right-3 xs:top-3">
              <ScoreDisplay score={props.score} isAnalyzing={props.isAnalyzing} variant="score" />
              {badge}
            </div>

            <div className="pointer-events-none absolute left-2 top-2 camera-hud-chip rounded-2xl border border-white/10 bg-black/30 text-slate-100 backdrop-blur xs:left-3 xs:top-3">
              {streamError ?? error ?? props.statusText}
            </div>

            <div className="absolute bottom-4 left-2 right-2 grid gap-1.5 xs:bottom-3 xs:gap-2 xs:left-3 xs:right-3 sm:bottom-3">
              <ScoreDisplay score={props.score} isAnalyzing={props.isAnalyzing} variant="bar" />
              <FeedbackPanel
                message={props.feedbackMessage}
                correctionBullets={props.correctionBullets}
                positiveObservation={props.positiveObservation}
                breathCue={props.breathCue}
                safetyNote={props.safetyNote}
              />
            </div>

            {props.countdown > 0 ? (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/30">
                <div className="text-6xl font-semibold tracking-tight text-white">{props.countdown}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
})
