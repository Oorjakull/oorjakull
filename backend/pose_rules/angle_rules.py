"""Pose-specific angle rules & feedback for the deterministic evaluator.

Every feedback string follows trainer-voice guidelines:
- Second person, present tense
- Anatomically specific
- Under 12 words
- Positive redirection (say what to do, not what's wrong)
"""
from __future__ import annotations

from typing import Any

# ── Rule schema ─────────────────────────────────────────────────────────────
#
# "joints": {
#     "<check_name>": {
#         "landmarks": ["<name_a>", "<name_b>", "<name_c>"],  # angle at b
#         "target_angle": <degrees>,
#         "tolerance": <±degrees>,
#         "feedback_low": "<trainer-voice string>",
#         "feedback_high": "<trainer-voice string or None>",
#         "weight": "critical" | "moderate" | "minor"   # default: moderate
#     }
# }
# "symmetry_checks": [ ... ]
# "stability_threshold": float   (max landmark velocity for 'held')
# "min_hold_frames": int         (~0.5s at 30fps)
# "good_score_threshold": int    (0-100 → triggers LLM)
#

POSE_RULES: dict[str, dict[str, Any]] = {
    # ── Standing / Sun-Sal poses ───────────────────────────────────────────
    "pranamasana": {
        "joints": {
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Gently straighten both legs, stay soft",
                "feedback_high": None,
                "weight": "moderate",
            },
            "right_knee": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Soften and straighten your right leg",
                "feedback_high": None,
                "weight": "moderate",
            },
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Lengthen your spine — crown toward ceiling",
                "feedback_high": "Draw your ribs gently inward",
                "weight": "critical",
            },
        },
        "symmetry_checks": [
            {
                "name": "shoulder_level",
                "points": ["left_shoulder", "right_shoulder"],
                "tolerance_y": 0.04,
                "feedback": "Level both shoulders evenly",
            }
        ],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 75,
    },
    "hasta_uttanasana": {
        "joints": {
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Keep your legs firm and straight",
                "feedback_high": None,
                "weight": "moderate",
            },
            "left_arm_extension": {
                "landmarks": ["left_shoulder", "left_elbow", "left_wrist"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Reach your arms up alongside your ears",
                "feedback_high": None,
                "weight": "critical",
            },
            "right_arm_extension": {
                "landmarks": ["right_shoulder", "right_elbow", "right_wrist"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Extend your right arm fully overhead",
                "feedback_high": None,
                "weight": "moderate",
            },
            "backbend": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 165,
                "tolerance": 20,
                "feedback_low": "Gently arc back from your upper back",
                "feedback_high": "Ease the backbend — protect your lower back",
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "padahastasana": {
        "joints": {
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Soften your knees if hamstrings feel tight",
                "feedback_high": None,
                "weight": "minor",
            },
            "forward_fold": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 60,
                "tolerance": 30,
                "feedback_low": "Hinge forward more from your hips",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [
            {
                "name": "hip_level",
                "points": ["left_hip", "right_hip"],
                "tolerance_y": 0.05,
                "feedback": "Keep both hips level and square",
            }
        ],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "mountain_pose": {
        "joints": {
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Straighten both legs — stay soft, not locked",
                "feedback_high": None,
                "weight": "moderate",
            },
            "right_knee": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Soften and straighten your right leg",
                "feedback_high": None,
                "weight": "moderate",
            },
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Stack your spine — crown toward the ceiling",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [
            {
                "name": "shoulder_level",
                "points": ["left_shoulder", "right_shoulder"],
                "tolerance_y": 0.04,
                "feedback": "Level both shoulders — let them relax down",
            },
            {
                "name": "hip_level",
                "points": ["left_hip", "right_hip"],
                "tolerance_y": 0.03,
                "feedback": "Keep hips level and weight balanced",
            },
        ],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 75,
    },
    "warrior_ii": {
        "joints": {
            "front_knee": {
                "landmarks": ["front_hip", "front_knee", "front_ankle"],
                "target_angle": 95,
                "tolerance": 15,
                "feedback_low": "Bend your front knee deeper over your ankle",
                "feedback_high": "Ease back — don't let your knee pass your toes",
                "weight": "critical",
            },
            "back_leg": {
                "landmarks": ["back_hip", "back_knee", "back_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Press through your back leg — straighten it",
                "feedback_high": None,
                "weight": "critical",
            },
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Stack your torso upright over your hips",
                "feedback_high": "You're leaning back — come to centre",
                "weight": "critical",
            },
            "left_arm": {
                "landmarks": ["left_shoulder", "left_elbow", "left_wrist"],
                "target_angle": 175,
                "tolerance": 15,
                "feedback_low": "Extend your left arm at shoulder height",
                "feedback_high": None,
                "weight": "moderate",
            },
            "right_arm": {
                "landmarks": ["right_shoulder", "right_elbow", "right_wrist"],
                "target_angle": 175,
                "tolerance": 15,
                "feedback_low": "Reach your right arm out with energy",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [
            {
                "name": "arm_level",
                "points": ["left_wrist", "right_wrist"],
                "tolerance_y": 0.06,
                "feedback": "Level both arms at shoulder height",
            }
        ],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 75,
    },
    "virabhadrasana_i": {
        "joints": {
            "front_knee": {
                "landmarks": ["front_hip", "front_knee", "front_ankle"],
                "target_angle": 95,
                "tolerance": 15,
                "feedback_low": "Bend your front knee toward ninety degrees",
                "feedback_high": "Ease your front knee slightly back",
                "weight": "critical",
            },
            "back_leg": {
                "landmarks": ["back_hip", "back_knee", "back_ankle"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Straighten your back leg and ground the heel",
                "feedback_high": None,
                "weight": "critical",
            },
            "arms_overhead": {
                "landmarks": ["left_shoulder", "left_elbow", "left_wrist"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Lift both arms high alongside your ears",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "trikonasana": {
        "joints": {
            "front_knee": {
                "landmarks": ["front_hip", "front_knee", "front_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Keep your front leg straight — don't lock it",
                "feedback_high": None,
                "weight": "critical",
            },
            "back_leg": {
                "landmarks": ["back_hip", "back_knee", "back_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Press your back leg firm and straight",
                "feedback_high": None,
                "weight": "moderate",
            },
            "torso_lateral": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 140,
                "tolerance": 20,
                "feedback_low": "Lengthen sideways more over your front leg",
                "feedback_high": "Come up slightly — don't compress your side",
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "plank_pose": {
        "joints": {
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Straighten your legs — firm your thighs",
                "feedback_high": None,
                "weight": "moderate",
            },
            "body_line": {
                "landmarks": ["left_shoulder", "left_hip", "left_ankle"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Lift your hips — form a straight line",
                "feedback_high": "Lower your hips to align with shoulders",
                "weight": "critical",
            },
            "left_arm": {
                "landmarks": ["left_shoulder", "left_elbow", "left_wrist"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Press your arms straight under shoulders",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [
            {
                "name": "shoulder_level",
                "points": ["left_shoulder", "right_shoulder"],
                "tolerance_y": 0.04,
                "feedback": "Keep both shoulders at the same height",
            }
        ],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "down_dog": {
        "joints": {
            "left_arm": {
                "landmarks": ["left_shoulder", "left_elbow", "left_wrist"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Straighten your arms — push the mat away",
                "feedback_high": None,
                "weight": "critical",
            },
            "spine_length": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 80,
                "tolerance": 20,
                "feedback_low": "Send your hips higher and back",
                "feedback_high": "Ease forward slightly to lengthen your spine",
                "weight": "critical",
            },
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Bend your knees to keep the spine long",
                "feedback_high": None,
                "weight": "minor",
            },
        },
        "symmetry_checks": [
            {
                "name": "arm_level",
                "points": ["left_wrist", "right_wrist"],
                "tolerance_y": 0.05,
                "feedback": "Press both hands evenly into the ground",
            }
        ],
        "stability_threshold": 0.015,
        "min_hold_frames": 20,
        "good_score_threshold": 70,
    },
    "bhujangasana": {
        "joints": {
            "left_arm": {
                "landmarks": ["left_shoulder", "left_elbow", "left_wrist"],
                "target_angle": 130,
                "tolerance": 25,
                "feedback_low": "Press gently to lift your chest more",
                "feedback_high": "Soften your arms — less force, more length",
                "weight": "moderate",
            },
            "backbend": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 150,
                "tolerance": 20,
                "feedback_low": "Lift your chest and draw shoulders back",
                "feedback_high": "Ease back to protect your lower spine",
                "weight": "critical",
            },
        },
        "symmetry_checks": [
            {
                "name": "shoulder_level",
                "points": ["left_shoulder", "right_shoulder"],
                "tolerance_y": 0.04,
                "feedback": "Level both shoulders — avoid tilting",
            }
        ],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "utkatasana": {
        "joints": {
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 120,
                "tolerance": 20,
                "feedback_low": "Sit deeper — bend your knees more",
                "feedback_high": "Rise slightly — ease up on your knees",
                "weight": "critical",
            },
            "right_knee": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 120,
                "tolerance": 20,
                "feedback_low": "Lower your hips evenly on both sides",
                "feedback_high": None,
                "weight": "moderate",
            },
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 150,
                "tolerance": 20,
                "feedback_low": "Lift your chest and reach arms high",
                "feedback_high": "Lean forward slightly to balance",
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    # ── Balance poses ──────────────────────────────────────────────────────
    "vrksasana_low_foot": {
        "joints": {
            "standing_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Keep your standing leg straight but soft",
                "feedback_high": None,
                "weight": "critical",
            },
            "lifted_knee": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 75,
                "tolerance": 30,
                "feedback_low": "Open your lifted knee out to the side",
                "feedback_high": None,
                "weight": "moderate",
            },
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Lengthen tall through your spine",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [
            {
                "name": "hip_level",
                "points": ["left_hip", "right_hip"],
                "tolerance_y": 0.05,
                "feedback": "Keep both hips level — don't drop one side",
            }
        ],
        "stability_threshold": 0.020,
        "min_hold_frames": 20,
        "good_score_threshold": 70,
    },
    # ── Seated poses ───────────────────────────────────────────────────────
    "sukhasana": {
        "joints": {
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Sit tall — lift from the crown of your head",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [
            {
                "name": "shoulder_level",
                "points": ["left_shoulder", "right_shoulder"],
                "tolerance_y": 0.04,
                "feedback": "Relax both shoulders evenly downward",
            }
        ],
        "stability_threshold": 0.012,
        "min_hold_frames": 20,
        "good_score_threshold": 75,
    },
    "baddha_konasana": {
        "joints": {
            "left_knee_open": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 80,
                "tolerance": 30,
                "feedback_low": "Let your knees fall open toward the floor",
                "feedback_high": None,
                "weight": "moderate",
            },
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 165,
                "tolerance": 20,
                "feedback_low": "Lengthen your spine — sit tall",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 75,
    },
    "paschimottanasana": {
        "joints": {
            "forward_fold": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 70,
                "tolerance": 25,
                "feedback_low": "Fold forward from your hips, not your back",
                "feedback_high": None,
                "weight": "critical",
            },
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Keep your legs long — bend knees if needed",
                "feedback_high": None,
                "weight": "minor",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "dandasana": {
        "joints": {
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Extend your legs straight in front of you",
                "feedback_high": None,
                "weight": "moderate",
            },
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 90,
                "tolerance": 15,
                "feedback_low": "Sit upright — imagine a wall behind your back",
                "feedback_high": "Lean back slightly less — find ninety degrees",
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 75,
    },
    # ── Kneeling / Tabletop poses ──────────────────────────────────────────
    "ashwa_sanchalanasana": {
        "joints": {
            "front_knee": {
                "landmarks": ["front_hip", "front_knee", "front_ankle"],
                "target_angle": 95,
                "tolerance": 20,
                "feedback_low": "Bend your front knee over your ankle",
                "feedback_high": "Ease back — keep knee above ankle",
                "weight": "critical",
            },
            "back_leg": {
                "landmarks": ["back_hip", "back_knee", "back_ankle"],
                "target_angle": 165,
                "tolerance": 15,
                "feedback_low": "Extend your back leg long behind you",
                "feedback_high": None,
                "weight": "moderate",
            },
            "torso_lift": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 155,
                "tolerance": 20,
                "feedback_low": "Lift your chest — draw shoulders back",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "vajrasana": {
        "joints": {
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Sit tall on your heels — lengthen spine",
                "feedback_high": None,
                "weight": "critical",
            },
            "knee_fold": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 40,
                "tolerance": 25,
                "feedback_low": "Fold your legs fully under you",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 80,
    },
    "marjaryasana_cat": {
        "joints": {
            "spine_round": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 130,
                "tolerance": 25,
                "feedback_low": "Round your spine more — push the floor away",
                "feedback_high": "Ease the rounding — find a gentle curve",
                "weight": "critical",
            },
            "left_arm": {
                "landmarks": ["left_shoulder", "left_elbow", "left_wrist"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Keep arms straight under your shoulders",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 10,
        "good_score_threshold": 70,
    },
    "bitilasana_cow": {
        "joints": {
            "spine_extend": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 160,
                "tolerance": 20,
                "feedback_low": "Drop your belly and lift your chest forward",
                "feedback_high": "Ease the extension — protect your lower back",
                "weight": "critical",
            },
            "left_arm": {
                "landmarks": ["left_shoulder", "left_elbow", "left_wrist"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Stack your wrists under your shoulders",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 10,
        "good_score_threshold": 70,
    },
    # ── Prone / Backbend poses ─────────────────────────────────────────────
    "sphinx_pose": {
        "joints": {
            "elbow_angle": {
                "landmarks": ["left_shoulder", "left_elbow", "left_wrist"],
                "target_angle": 90,
                "tolerance": 15,
                "feedback_low": "Place forearms flat — elbows under shoulders",
                "feedback_high": "Walk elbows back under your shoulders",
                "weight": "critical",
            },
            "chest_lift": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 155,
                "tolerance": 20,
                "feedback_low": "Lift your chest gently off the floor",
                "feedback_high": "Ease down — keep it gentle on your back",
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 75,
    },
    "salabhasana": {
        "joints": {
            "chest_lift": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 160,
                "tolerance": 20,
                "feedback_low": "Lift your chest higher off the floor",
                "feedback_high": "Ease slightly — don't compress your neck",
                "weight": "critical",
            },
            "leg_lift": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Lift and lengthen your legs behind you",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 12,
        "good_score_threshold": 70,
    },
    # ── Supine poses ───────────────────────────────────────────────────────
    "setu_bandhasana": {
        "joints": {
            "knee_angle": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 90,
                "tolerance": 20,
                "feedback_low": "Walk your feet closer to your hips",
                "feedback_high": "Walk your feet slightly farther away",
                "weight": "critical",
            },
            "hip_lift": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 140,
                "tolerance": 25,
                "feedback_low": "Press your feet and lift your hips higher",
                "feedback_high": "Ease down slightly — keep neck relaxed",
                "weight": "critical",
            },
        },
        "symmetry_checks": [
            {
                "name": "knee_parallel",
                "points": ["left_knee", "right_knee"],
                "tolerance_y": 0.04,
                "feedback": "Keep both knees parallel and hip-width apart",
            }
        ],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "savasana": {
        "joints": {
            "relaxation": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 175,
                "tolerance": 20,
                "feedback_low": "Let your whole body rest on the ground",
                "feedback_high": None,
                "weight": "minor",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.010,
        "min_hold_frames": 30,
        "good_score_threshold": 80,
    },
    # ── Additional frequently-used poses ───────────────────────────────────
    "malasana": {
        "joints": {
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 60,
                "tolerance": 25,
                "feedback_low": "Sink your hips lower between your heels",
                "feedback_high": None,
                "weight": "critical",
            },
            "right_knee": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 60,
                "tolerance": 25,
                "feedback_low": "Drop both knees evenly toward the floor",
                "feedback_high": None,
                "weight": "moderate",
            },
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 150,
                "tolerance": 25,
                "feedback_low": "Lift your chest — lengthen through the spine",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "utthita_parsvakonasana_beginner": {
        "joints": {
            "front_knee": {
                "landmarks": ["front_hip", "front_knee", "front_ankle"],
                "target_angle": 95,
                "tolerance": 15,
                "feedback_low": "Bend your front knee to a right angle",
                "feedback_high": "Ease your knee back slightly",
                "weight": "critical",
            },
            "torso_lateral": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 130,
                "tolerance": 25,
                "feedback_low": "Lengthen your side body over your front leg",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "prasarita_padottanasana": {
        "joints": {
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Keep your legs straight and firm",
                "feedback_high": None,
                "weight": "moderate",
            },
            "forward_fold": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 80,
                "tolerance": 25,
                "feedback_low": "Fold forward — let your crown reach down",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [
            {
                "name": "hip_level",
                "points": ["left_hip", "right_hip"],
                "tolerance_y": 0.04,
                "feedback": "Keep both hips level as you fold",
            }
        ],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "ardha_uttanasana": {
        "joints": {
            "half_lift": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 90,
                "tolerance": 20,
                "feedback_low": "Lift halfway — create a flat back",
                "feedback_high": "Lower slightly to a flat-back position",
                "weight": "critical",
            },
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Straighten both legs if possible",
                "feedback_high": None,
                "weight": "minor",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 10,
        "good_score_threshold": 70,
    },
    "uttanasana": {
        "joints": {
            "forward_fold": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 55,
                "tolerance": 25,
                "feedback_low": "Release forward — let gravity draw you deeper",
                "feedback_high": None,
                "weight": "critical",
            },
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Soften your knees to protect your back",
                "feedback_high": None,
                "weight": "minor",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "parsvottanasana_short_stance": {
        "joints": {
            "front_knee": {
                "landmarks": ["front_hip", "front_knee", "front_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Straighten your front leg — micro-bend okay",
                "feedback_high": None,
                "weight": "critical",
            },
            "forward_fold": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 70,
                "tolerance": 25,
                "feedback_low": "Fold forward over your front leg",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "garudasana_arms": {
        "joints": {
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Sit tall — lengthen through the spine",
                "feedback_high": None,
                "weight": "critical",
            },
            "arm_wrap": {
                "landmarks": ["left_shoulder", "left_elbow", "left_wrist"],
                "target_angle": 60,
                "tolerance": 25,
                "feedback_low": "Wrap your arms and lift elbows higher",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "janu_sirsasana_left": {
        "joints": {
            "extended_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Extend your left leg long in front",
                "feedback_high": None,
                "weight": "moderate",
            },
            "forward_fold": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 80,
                "tolerance": 25,
                "feedback_low": "Fold gently toward your extended leg",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "janu_sirsasana_right": {
        "joints": {
            "extended_knee": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Extend your right leg long in front",
                "feedback_high": None,
                "weight": "moderate",
            },
            "forward_fold": {
                "landmarks": ["right_shoulder", "right_hip", "right_knee"],
                "target_angle": 80,
                "tolerance": 25,
                "feedback_low": "Fold gently toward your extended leg",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "upavistha_konasana_upright": {
        "joints": {
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 160,
                "tolerance": 20,
                "feedback_low": "Sit tall and lengthen through your crown",
                "feedback_high": None,
                "weight": "critical",
            },
            "left_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Keep both legs straight and active",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "gomukhasana_arms": {
        "joints": {
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Sit tall and keep your spine long",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    # ── Kneeling variants ──────────────────────────────────────────────────
    "anjaneyasana_left": {
        "joints": {
            "front_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 95,
                "tolerance": 15,
                "feedback_low": "Bend your front knee over your ankle",
                "feedback_high": "Don't let your knee pass your toes",
                "weight": "critical",
            },
            "back_leg": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 160,
                "tolerance": 20,
                "feedback_low": "Extend your back leg long behind you",
                "feedback_high": None,
                "weight": "moderate",
            },
            "torso_lift": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 155,
                "tolerance": 20,
                "feedback_low": "Lift your chest and reach arms high",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "anjaneyasana_right": {
        "joints": {
            "front_knee": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 95,
                "tolerance": 15,
                "feedback_low": "Bend your front knee over your ankle",
                "feedback_high": "Don't let your knee pass your toes",
                "weight": "critical",
            },
            "back_leg": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 160,
                "tolerance": 20,
                "feedback_low": "Extend your back leg long behind you",
                "feedback_high": None,
                "weight": "moderate",
            },
            "torso_lift": {
                "landmarks": ["right_shoulder", "right_hip", "right_knee"],
                "target_angle": 155,
                "tolerance": 20,
                "feedback_low": "Lift your chest and reach arms high",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "ardha_hanumanasana_left": {
        "joints": {
            "front_leg": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 165,
                "tolerance": 15,
                "feedback_low": "Extend your front leg — flex the foot",
                "feedback_high": None,
                "weight": "critical",
            },
            "fold": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 100,
                "tolerance": 25,
                "feedback_low": "Hinge forward from your hips with a flat back",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "ardha_hanumanasana_right": {
        "joints": {
            "front_leg": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 165,
                "tolerance": 15,
                "feedback_low": "Extend your front leg — flex the foot",
                "feedback_high": None,
                "weight": "critical",
            },
            "fold": {
                "landmarks": ["right_shoulder", "right_hip", "right_knee"],
                "target_angle": 100,
                "tolerance": 25,
                "feedback_low": "Hinge forward from your hips with a flat back",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "thread_the_needle_left": {
        "joints": {
            "twist": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 140,
                "tolerance": 25,
                "feedback_low": "Thread your arm deeper and rotate your chest",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 65,
    },
    "thread_the_needle_right": {
        "joints": {
            "twist": {
                "landmarks": ["right_shoulder", "right_hip", "right_knee"],
                "target_angle": 140,
                "tolerance": 25,
                "feedback_low": "Thread your arm deeper and rotate your chest",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 65,
    },
    "parsva_balasana_left": {
        "joints": {
            "side_stretch": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 120,
                "tolerance": 30,
                "feedback_low": "Reach further to deepen the side stretch",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "parsva_balasana_right": {
        "joints": {
            "side_stretch": {
                "landmarks": ["right_shoulder", "right_hip", "right_knee"],
                "target_angle": 120,
                "tolerance": 30,
                "feedback_low": "Reach further to deepen the side stretch",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.012,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    # ── Supine / Restorative ───────────────────────────────────────────────
    "apanasana": {
        "joints": {
            "knee_to_chest": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 60,
                "tolerance": 25,
                "feedback_low": "Draw your knees closer toward your chest",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.010,
        "min_hold_frames": 15,
        "good_score_threshold": 75,
    },
    "supta_matsyendrasana_left": {
        "joints": {
            "twist": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 130,
                "tolerance": 30,
                "feedback_low": "Let your knees fall to the left gently",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.010,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "supta_matsyendrasana_right": {
        "joints": {
            "twist": {
                "landmarks": ["right_shoulder", "right_hip", "right_knee"],
                "target_angle": 130,
                "tolerance": 30,
                "feedback_low": "Let your knees fall to the right gently",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.010,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "ananda_balasana": {
        "joints": {
            "knee_open": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 90,
                "tolerance": 25,
                "feedback_low": "Gently pull your feet toward the floor",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.010,
        "min_hold_frames": 15,
        "good_score_threshold": 70,
    },
    "supta_baddha_konasana": {
        "joints": {
            "knee_open": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 80,
                "tolerance": 30,
                "feedback_low": "Let your knees open wide toward the floor",
                "feedback_high": None,
                "weight": "minor",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.010,
        "min_hold_frames": 20,
        "good_score_threshold": 75,
    },
    "makarasana": {
        "joints": {
            "relaxation": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 175,
                "tolerance": 15,
                "feedback_low": "Rest completely on the floor — let go",
                "feedback_high": None,
                "weight": "minor",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.010,
        "min_hold_frames": 20,
        "good_score_threshold": 80,
    },
    # ── Balance / Prep poses ───────────────────────────────────────────────
    "heel_to_toe_balance": {
        "joints": {
            "torso_upright": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Stand tall — stack head over hips",
                "feedback_high": None,
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.020,
        "min_hold_frames": 20,
        "good_score_threshold": 70,
    },
    "natarajasana_prep (right)": {
        "joints": {
            "standing_knee": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Keep your standing leg firm and straight",
                "feedback_high": None,
                "weight": "critical",
            },
            "lifted_leg": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 100,
                "tolerance": 25,
                "feedback_low": "Bend and lift your back foot higher",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.020,
        "min_hold_frames": 15,
        "good_score_threshold": 65,
    },
    "natarajasana_prep (left)": {
        "joints": {
            "standing_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Keep your standing leg firm and straight",
                "feedback_high": None,
                "weight": "critical",
            },
            "lifted_leg": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 100,
                "tolerance": 25,
                "feedback_low": "Bend and lift your back foot higher",
                "feedback_high": None,
                "weight": "moderate",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.020,
        "min_hold_frames": 15,
        "good_score_threshold": 65,
    },
    "virabhadrasana_iii_prep(right)": {
        "joints": {
            "standing_knee": {
                "landmarks": ["right_hip", "right_knee", "right_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Keep your standing leg firm and straight",
                "feedback_high": None,
                "weight": "critical",
            },
            "torso_forward": {
                "landmarks": ["right_shoulder", "right_hip", "right_knee"],
                "target_angle": 95,
                "tolerance": 20,
                "feedback_low": "Hinge forward until torso is parallel to floor",
                "feedback_high": "Rise slightly — keep a flat back",
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.020,
        "min_hold_frames": 15,
        "good_score_threshold": 65,
    },
    "virabhadrasana_iii_prep(left)": {
        "joints": {
            "standing_knee": {
                "landmarks": ["left_hip", "left_knee", "left_ankle"],
                "target_angle": 175,
                "tolerance": 10,
                "feedback_low": "Keep your standing leg firm and straight",
                "feedback_high": None,
                "weight": "critical",
            },
            "torso_forward": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 95,
                "tolerance": 20,
                "feedback_low": "Hinge forward until torso is parallel to floor",
                "feedback_high": "Rise slightly — keep a flat back",
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.020,
        "min_hold_frames": 15,
        "good_score_threshold": 65,
    },
    "parvatasana_tabletop": {
        "joints": {
            "left_arm": {
                "landmarks": ["left_shoulder", "left_elbow", "left_wrist"],
                "target_angle": 170,
                "tolerance": 15,
                "feedback_low": "Stack your wrists under your shoulders",
                "feedback_high": None,
                "weight": "moderate",
            },
            "hip_angle": {
                "landmarks": ["left_shoulder", "left_hip", "left_knee"],
                "target_angle": 90,
                "tolerance": 15,
                "feedback_low": "Align hips over your knees",
                "feedback_high": "Draw your hips back over your knees",
                "weight": "critical",
            },
        },
        "symmetry_checks": [],
        "stability_threshold": 0.015,
        "min_hold_frames": 15,
        "good_score_threshold": 75,
    },
}


def get_rules(pose_id: str) -> dict[str, Any] | None:
    """Retrieve angle rules for a pose. Returns None if not defined."""
    return POSE_RULES.get(pose_id)
