import { useCallback, useEffect, useRef, useState } from 'react'
import type { Landmark } from '../api/client'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'

/** Exponential Moving Average smoothing factor (0 = all previous, 1 = all current) */
const EMA_ALPHA = 0.4

function smoothLandmarks(prev: Landmark[], curr: Landmark[]): Landmark[] {
  return curr.map((c, i) => {
    const p = prev[i]
    if (!p) return c
    return {
      x: EMA_ALPHA * c.x + (1 - EMA_ALPHA) * p.x,
      y: EMA_ALPHA * c.y + (1 - EMA_ALPHA) * p.y,
      z: EMA_ALPHA * c.z + (1 - EMA_ALPHA) * p.z,
      visibility: c.visibility, // keep current visibility
    }
  })
}

export function usePoseLandmarker() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const prevLandmarksRef = useRef<Landmark[] | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'
        )

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task'
          },
          runningMode: 'VIDEO',
          numPoses: 1
        })

        if (!cancelled) {
          landmarkerRef.current = landmarker
          setReady(true)
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load MediaPipe Pose models.')
      }
    }

    init()
    return () => {
      cancelled = true
      landmarkerRef.current?.close()
      landmarkerRef.current = null
    }
  }, [])

  const getLandmarksFromVideo = useCallback(async (video: HTMLVideoElement): Promise<Landmark[] | null> => {
    const landmarker = landmarkerRef.current
    if (!landmarker) return null

    const ts = performance.now()
    const result = landmarker.detectForVideo(video, ts)
    const pose = result.landmarks?.[0]
    if (!pose || pose.length !== 33) return null

    const raw: Landmark[] = pose.map((p) => ({
      x: p.x,
      y: p.y,
      z: p.z,
      visibility: (p.visibility ?? 0) as number
    }))

    // Apply EMA temporal smoothing to reduce jitter
    const prev = prevLandmarksRef.current
    const smoothed = prev ? smoothLandmarks(prev, raw) : raw
    prevLandmarksRef.current = smoothed

    return smoothed
  }, [])

  return { ready, error, getLandmarksFromVideo }
}
