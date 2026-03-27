"""MediaPipe Pose landmark index mapping — semantic names for 33 landmarks."""
from __future__ import annotations

# ── Raw MediaPipe Pose landmark indices ─────────────────────────────────────
MP_LANDMARKS: dict[str, int] = {
    "nose": 0,
    "left_eye_inner": 1,
    "left_eye": 2,
    "left_eye_outer": 3,
    "right_eye_inner": 4,
    "right_eye": 5,
    "right_eye_outer": 6,
    "left_ear": 7,
    "right_ear": 8,
    "mouth_left": 9,
    "mouth_right": 10,
    "left_shoulder": 11,
    "right_shoulder": 12,
    "left_elbow": 13,
    "right_elbow": 14,
    "left_wrist": 15,
    "right_wrist": 16,
    "left_pinky": 17,
    "right_pinky": 18,
    "left_index": 19,
    "right_index": 20,
    "left_thumb": 21,
    "right_thumb": 22,
    "left_hip": 23,
    "right_hip": 24,
    "left_knee": 25,
    "right_knee": 26,
    "left_ankle": 27,
    "right_ankle": 28,
    "left_heel": 29,
    "right_heel": 30,
    "left_foot_index": 31,
    "right_foot_index": 32,
}

# Reverse lookup: index → name
MP_LANDMARK_NAMES: dict[int, str] = {v: k for k, v in MP_LANDMARKS.items()}

# ── Derived virtual points (computed from pairs/triples) ────────────────────
DERIVED_POINTS: dict[str, tuple[str, str]] = {
    "mid_hip": ("left_hip", "right_hip"),
    "mid_shoulder": ("left_shoulder", "right_shoulder"),
}

# ── Per-pose front/back leg mapping ─────────────────────────────────────────
# By default LEFT is "front" — override per pose where the stance differs.
# "symmetric" means both legs play the same role (e.g. Tadasana, Plank).
POSE_STANCE: dict[str, dict[str, str]] = {
    # Symmetric poses — both sides equivalent
    "__default__": {
        "front_hip": "left_hip",
        "front_knee": "left_knee",
        "front_ankle": "left_ankle",
        "back_hip": "right_hip",
        "back_knee": "right_knee",
        "back_ankle": "right_ankle",
    },
}

# Poses that are truly symmetric (standing, seated, supine, prone, etc.)
_SYMMETRIC_POSES = [
    "mountain_pose", "pranamasana", "hasta_uttanasana", "padahastasana",
    "plank_pose", "down_dog", "uttanasana", "ardha_uttanasana",
    "utkatasana", "malasana", "prasarita_padottanasana",
    "sukhasana", "dandasana", "paschimottanasana", "vajrasana",
    "baddha_konasana", "upavistha_konasana_upright",
    "marjaryasana_cat", "bitilasana_cow", "bhujangasana",
    "sphinx_pose", "salabhasana", "makarasana", "setu_bandhasana",
    "apanasana", "savasana", "ananda_balasana", "supta_baddha_konasana",
    "parvatasana_tabletop", "gomukhasana_arms", "garudasana_arms",
    "heel_to_toe_balance",
]

for _pid in _SYMMETRIC_POSES:
    POSE_STANCE[_pid] = POSE_STANCE["__default__"].copy()

# Lateral/asymmetric poses — LEFT front by convention for camera
_LEFT_FRONT_POSES = [
    "warrior_ii", "virabhadrasana_i", "trikonasana",
    "utthita_parsvakonasana_beginner", "parsvottanasana_short_stance",
    "ashwa_sanchalanasana", "anjaneyasana_left",
    "ardha_hanumanasana_left", "janu_sirsasana_left",
    "thread_the_needle_left", "parsva_balasana_left",
    "supta_matsyendrasana_left",
    "vrksasana_low_foot",  # LEFT leg standing, RIGHT lifted
    "natarajasana_prep (left)",
    "virabhadrasana_iii_prep(left)",
]

for _pid in _LEFT_FRONT_POSES:
    POSE_STANCE[_pid] = {
        "front_hip": "left_hip",
        "front_knee": "left_knee",
        "front_ankle": "left_ankle",
        "back_hip": "right_hip",
        "back_knee": "right_knee",
        "back_ankle": "right_ankle",
    }

# Right-side variants
_RIGHT_FRONT_POSES = [
    "anjaneyasana_right",
    "ardha_hanumanasana_right",
    "janu_sirsasana_right",
    "thread_the_needle_right",
    "parsva_balasana_right",
    "supta_matsyendrasana_right",
    "natarajasana_prep (right)",
    "virabhadrasana_iii_prep(right)",
]

for _pid in _RIGHT_FRONT_POSES:
    POSE_STANCE[_pid] = {
        "front_hip": "right_hip",
        "front_knee": "right_knee",
        "front_ankle": "right_ankle",
        "back_hip": "left_hip",
        "back_knee": "left_knee",
        "back_ankle": "left_ankle",
    }


def get_stance(pose_id: str) -> dict[str, str]:
    """Return the front/back leg landmark mapping for the given pose."""
    return POSE_STANCE.get(pose_id, POSE_STANCE["__default__"])
