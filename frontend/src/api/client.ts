export type ExpectedPose =
  | 'Tadasana'
  | 'Warrior II'
  | 'Tree Pose'
  | 'Down Dog'
  | 'Goddess'
  | 'Plank'
export type UserLevel = 'beginner' | 'intermediate' | 'advanced'

export type FocusArea = 'front_knee' | 'back_leg' | 'arms' | 'torso' | 'hips' | 'balance' | 'none'
export type Severity = 'minor' | 'moderate' | 'major'

export type Deviation = {
  issue: string
  joint_or_area: string
  measured_value: number
  ideal_range: string
  severity: Severity
}

export type AlignmentResponse = {
  pose_match: 'aligned' | 'partially_aligned' | 'misaligned'
  confidence: 'high' | 'medium' | 'low'
  primary_focus_area: FocusArea
  deviations: Deviation[]
  correction_message: string
}

export type Landmark = { x: number; y: number; z: number; visibility: number }

export async function evaluateAlignment(params: {
  baseUrl: string
  clientId: string
  expectedPose: ExpectedPose
  userLevel: UserLevel
  landmarks: Landmark[]
}): Promise<AlignmentResponse> {
  const res = await fetch(`${params.baseUrl}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: params.clientId,
      expected_pose: params.expectedPose,
      user_level: params.userLevel,
      landmarks: params.landmarks
    })
  })

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`)
  }

  return (await res.json()) as AlignmentResponse
}
