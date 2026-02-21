import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { AlignmentResponse, Landmark } from '../api/client'
import { usePoseLandmarker } from '../hooks/usePoseLandmarker'
import ConfidenceBadge from './ConfidenceBadge'
import FeedbackPanel from './FeedbackPanel'
import ScoreDisplay from './ScoreDisplay'

function drawSkeleton(params: {
  canvas: HTMLCanvasElement
  landmarks: Landmark[]
  displayWidth: number
  displayHeight: number
  videoWidth: number
  videoHeight: number
}) {
  const { canvas, landmarks, displayWidth, displayHeight, videoWidth, videoHeight } = params
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = displayWidth
  const h = displayHeight

  // Video is displayed with object-contain, so account for letterboxing.
  const scale = Math.min(w / videoWidth, h / videoHeight)
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
  onLandmarks: (landmarks: Landmark[], visibilityMean: number) => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  const { ready, error, getLandmarksFromVideo } = usePoseLandmarker()
  const [streamError, setStreamError] = useState<string | null>(null)

  const badge = useMemo(() => <ConfidenceBadge confidence={props.confidence} />, [props.confidence])

  useEffect(() => {
    let stream: MediaStream | null = null

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch {
        setStreamError('Camera unavailable.')
      }
    }

    start()

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    let raf = 0

    const tick = async () => {
      if (props.running && videoRef.current && canvasRef.current && ready) {
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

        const landmarks = await getLandmarksFromVideo(video)
        if (landmarks && landmarks.length === 33) {
          drawSkeleton({
            canvas,
            landmarks,
            displayWidth,
            displayHeight,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight
          })
          const visibilityMean = landmarks.reduce((a, l) => a + l.visibility, 0) / landmarks.length
          props.onLandmarks(landmarks, visibilityMean)
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [props.running, ready, getLandmarksFromVideo, props.onLandmarks])

  const headerBadge = ready ? 'MediaPipe ready' : 'Loading…'

  return (
    <div className="min-h-0 h-full rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur flex flex-col">
      <div className="flex items-start justify-between gap-4 p-3">
        <div>
          <div className="text-xl font-medium tracking-tight text-slate-50">Your camera</div>
          <div className="mt-1 text-xs text-slate-300">Live feed + skeleton</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
          {headerBadge}
        </div>
      </div>

      <div className="min-h-0 flex-1 px-3 pb-3">
        <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl shadow-black/30">
          <div ref={stageRef} className="relative h-full w-full">
            <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-contain" />
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

            <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-2">
              <ScoreDisplay score={props.score} isAnalyzing={props.isAnalyzing} variant="score" />
              {badge}
            </div>

            <div className="pointer-events-none absolute left-3 top-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-1 text-xs text-slate-100 backdrop-blur">
              {streamError ?? error ?? props.statusText}
            </div>

            <div className="absolute bottom-3 left-3 right-3 grid gap-2">
              <ScoreDisplay score={props.score} isAnalyzing={props.isAnalyzing} variant="bar" />
              <FeedbackPanel message={props.feedbackMessage} />
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
