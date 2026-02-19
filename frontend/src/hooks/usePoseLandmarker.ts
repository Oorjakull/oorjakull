import { useCallback, useEffect, useRef, useState } from 'react'
import type { Landmark } from '../api/client'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'

export function usePoseLandmarker() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const landmarkerRef = useRef<PoseLandmarker | null>(null)

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
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
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

    return pose.map((p) => ({
      x: p.x,
      y: p.y,
      z: p.z,
      visibility: (p.visibility ?? 0) as number
    }))
  }, [])

  return { ready, error, getLandmarksFromVideo }
}
