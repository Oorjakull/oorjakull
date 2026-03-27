import type { ExpectedPose, FocusArea, Severity } from '../api/client'

export type PoseReference = {
  pose: ExpectedPose
  kind: 'image' | 'video'
  src: string
  /** Stable pose_id matching backend pose_library.json */
  poseId?: string
}

// ── Available reference images (images we actually ship) ───────────────────
export const POSE_REFERENCES: PoseReference[] = [
  { pose: 'Pranamasana',            kind: 'image', src: '/poses/train/Pranamasana.jpeg',                poseId: 'pranamasana' },
  { pose: 'Hasta Uttanasana',       kind: 'image', src: '/poses/train/Hasta%20Uttanasana.png',          poseId: 'hasta_uttanasana' },
  { pose: 'Padahastasana',          kind: 'image', src: '/poses/train/Padahastasana.png',               poseId: 'padahastasana' },
  { pose: 'Ashwa Sanchalanasana',   kind: 'image', src: '/poses/train/Ashwa%20Sanchalanasana.png',      poseId: 'ashwa_sanchalanasana' },
  { pose: 'Tadasana',               kind: 'image', src: '/poses/train/Tadasana.png',                    poseId: 'mountain_pose' },
  { pose: 'Warrior II',             kind: 'image', src: '/poses/train/Warrior.png',                     poseId: 'warrior_ii' },
  { pose: 'Down Dog',               kind: 'image', src: '/poses/train/Downdog.png',                     poseId: 'down_dog' },
  { pose: 'Goddess',                kind: 'image', src: '/poses/train/Godess.png' },
  { pose: 'Plank',                  kind: 'image', src: '/poses/train/Plank.png',                       poseId: 'plank_pose' },
  // ── New poses (no reference image yet — use placeholder) ─────────────────
  { pose: 'malasana',               kind: 'image', src: '',   poseId: 'malasana' },
  { pose: 'Bhujangasana',           kind: 'image', src: '',   poseId: 'bhujangasana' },
  { pose: 'Utkatasana',             kind: 'image', src: '',   poseId: 'utkatasana' },
  { pose: 'Virabhadrasana I',       kind: 'image', src: '',   poseId: 'virabhadrasana_i' },
  { pose: 'Trikonasana',            kind: 'image', src: '',   poseId: 'trikonasana' },
  { pose: 'Utthita Parsvakonasana', kind: 'image', src: '',   poseId: 'utthita_parsvakonasana_beginner' },
  { pose: 'Prasarita Padottanasana',kind: 'image', src: '',   poseId: 'prasarita_padottanasana' },
  { pose: 'Ardha Uttanasana',       kind: 'image', src: '',   poseId: 'ardha_uttanasana' },
  { pose: 'Uttanasana',             kind: 'image', src: '',   poseId: 'uttanasana' },
  { pose: 'Parsvottanasana',        kind: 'image', src: '',   poseId: 'parsvottanasana_short_stance' },
  { pose: 'Vrksasana',              kind: 'image', src: '',   poseId: 'vrksasana_low_foot' },
  { pose: 'Garudasana Arms',        kind: 'image', src: '',   poseId: 'garudasana_arms' },
  { pose: 'Sukhasana',              kind: 'image', src: '',   poseId: 'sukhasana' },
  { pose: 'Baddha Konasana',        kind: 'image', src: '',   poseId: 'baddha_konasana' },
  { pose: 'Janu Sirsasana',         kind: 'image', src: '',   poseId: 'janu_sirsasana_left' },
  { pose: 'Paschimottanasana',      kind: 'image', src: '',   poseId: 'paschimottanasana' },
  { pose: 'Upavistha Konasana',     kind: 'image', src: '',   poseId: 'upavistha_konasana_upright' },
  { pose: 'Gomukhasana Arms',       kind: 'image', src: '',   poseId: 'gomukhasana_arms' },
  { pose: 'Dandasana',              kind: 'image', src: '',   poseId: 'dandasana' },
  { pose: 'Vajrasana',              kind: 'image', src: '',   poseId: 'vajrasana' },
  { pose: 'Marjaryasana',           kind: 'image', src: '',   poseId: 'marjaryasana_cat' },
  { pose: 'Bitilasana',             kind: 'image', src: '',   poseId: 'bitilasana_cow' },
  { pose: 'Anjaneyasana',           kind: 'image', src: '',   poseId: 'anjaneyasana_left' },
  { pose: 'Ardha Hanumanasana',     kind: 'image', src: '',   poseId: 'ardha_hanumanasana_left' },
  { pose: 'Parsva Balasana',        kind: 'image', src: '',   poseId: 'parsva_balasana_left' },
  { pose: 'Salamba Bhujangasana',   kind: 'image', src: '',   poseId: 'sphinx_pose' },
  { pose: 'Salabhasana',            kind: 'image', src: '',   poseId: 'salabhasana' },
  { pose: 'Makarasana',             kind: 'image', src: '',   poseId: 'makarasana' },
  { pose: 'Setu Bandhasana',        kind: 'image', src: '',   poseId: 'setu_bandhasana' },
  { pose: 'Apanasana',              kind: 'image', src: '',   poseId: 'apanasana' },
  { pose: 'Supta Matsyendrasana',   kind: 'image', src: '',   poseId: 'supta_matsyendrasana_left' },
  { pose: 'Savasana',               kind: 'image', src: '',   poseId: 'savasana' },
  { pose: 'Tandem Balance',         kind: 'image', src: '',   poseId: 'heel_to_toe_balance' },
  { pose: 'Natarajasana Prep',      kind: 'image', src: '',   poseId: 'natarajasana_prep (right)' },
  { pose: 'Virabhadrasana III Prep', kind: 'image', src: '',  poseId: 'virabhadrasana_iii_prep(right)' },
  { pose: 'Parvatasana Prep',       kind: 'image', src: '',   poseId: 'parvatasana_tabletop' },
  { pose: 'Ananda Balasana',        kind: 'image', src: '',   poseId: 'ananda_balasana' },
  { pose: 'Supta Baddha Konasana',  kind: 'image', src: '',   poseId: 'supta_baddha_konasana' },
]

/** Lookup helper — returns the first reference for a given pose name. */
export function getReferenceForPose(poseName: string): PoseReference | undefined {
  return POSE_REFERENCES.find(r => r.pose === poseName)
}

/** Lookup by backend pose_id. */
export function getReferenceByPoseId(poseId: string): PoseReference | undefined {
  return POSE_REFERENCES.find(r => r.poseId === poseId)
}

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
