import { useEffect, useRef, useState } from 'react'
import type { Landmark } from '../api/client'
import { usePoseLandmarker } from '../hooks/usePoseLandmarker'

function drawSkeleton(canvas: HTMLCanvasElement, landmarks: Landmark[]) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(0, 255, 180, 0.75)'
  for (const lm of landmarks) {
    const x = lm.x * w
    const y = lm.y * h
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function LivePanel(props: {
  running: boolean
  countdown: number
  onLandmarks: (landmarks: Landmark[], visibilityMean: number) => void
  statusText: string
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const { ready, error, getLandmarksFromVideo } = usePoseLandmarker()
  const [streamError, setStreamError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (e) {
        setStreamError('Camera permission denied or camera unavailable.')
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

        // Keep canvas in sync
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }

        const landmarks = await getLandmarksFromVideo(video)
        if (landmarks && landmarks.length === 33) {
          drawSkeleton(canvas, landmarks)
          const visibilityMean = landmarks.reduce((a, l) => a + l.visibility, 0) / landmarks.length
          props.onLandmarks(landmarks, visibilityMean)
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [props.running, ready, getLandmarksFromVideo])

  return (
    <div className="panel">
      <div className="panelHeader">
        <div>
          <div style={{ fontWeight: 650 }}>Live camera</div>
          <div className="small">Skeleton overlay (MediaPipe)</div>
        </div>
        <div className="badge">{ready ? 'MediaPipe ready' : 'Loading…'}</div>
      </div>
      <div className="panelBody">
        <div className="videoStage">
          <video ref={videoRef} autoPlay playsInline muted />
          <canvas ref={canvasRef} />
          <div className="statusPill">{streamError ?? error ?? props.statusText}</div>
          {props.countdown > 0 ? <div className="countdown">{props.countdown}</div> : null}
        </div>
      </div>
    </div>
  )
}
