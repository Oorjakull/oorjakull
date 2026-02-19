import type { ExpectedPose, FocusArea, Severity } from '../api/client'

export type PoseReference = {
  pose: ExpectedPose
  imageSrc: string
}

export const POSE_REFERENCES: PoseReference[] = [
  { pose: 'Tadasana', imageSrc: '/poses/tadasana.svg' },
  { pose: 'Warrior II', imageSrc: '/poses/train/warrior2.jpg' },
  { pose: 'Tree Pose', imageSrc: '/poses/train/tree.jpg' },
  { pose: 'Down Dog', imageSrc: '/poses/train/downdog.jpg' },
  { pose: 'Goddess', imageSrc: '/poses/train/goddess.jpg' },
  { pose: 'Plank', imageSrc: '/poses/train/plank.jpg' }
]

export function severityColor(sev: Severity): string {
  switch (sev) {
    case 'minor':
      return '#f4c542' // yellow
    case 'moderate':
      return '#f08a24' // orange
    case 'major':
      return '#e03a3a' // red
  }
}

export function worstSeverity(deviations: { severity: Severity }[]): Severity {
  if (deviations.some((d) => d.severity === 'major')) return 'major'
  if (deviations.some((d) => d.severity === 'moderate')) return 'moderate'
  return 'minor'
}

export type HighlightState = {
  focusArea: FocusArea
  severity: Severity | null
}
