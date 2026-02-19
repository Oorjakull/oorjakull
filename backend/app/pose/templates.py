from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PoseTemplate:
    name: str
    # Ideal ranges for angles/metrics (human-friendly strings used by Gemini)
    ideal_ranges: dict[str, str]


POSE_TEMPLATES: dict[str, PoseTemplate] = {
    "Tadasana": PoseTemplate(
        name="Tadasana",
        ideal_ranges={
            "front_knee": "170-180",
            "back_knee": "170-180",
            "left_arm": "160-180",
            "right_arm": "160-180",
            "torso_tilt": "0-6",
            "arm_level_difference": "0-0.03",
            "hip_level_difference": "0-0.03",
            "center_offset": "0-0.05",
        },
    ),
    "Warrior II": PoseTemplate(
        name="Warrior II",
        ideal_ranges={
            "front_knee": "85-115",
            "back_knee": "165-180",
            "left_arm": "165-180",
            "right_arm": "165-180",
            "torso_tilt": "0-10",
            "arm_level_difference": "0-0.05",
            "hip_level_difference": "0-0.05",
            "center_offset": "0-0.08",
        },
    ),
    "Tree Pose": PoseTemplate(
        name="Tree Pose",
        ideal_ranges={
            # standing knee (front_knee) should be mostly straight
            "front_knee": "165-180",
            # lifted knee (back_knee) tends to be noticeably bent/outward
            "back_knee": "40-110",
            "left_arm": "120-180",
            "right_arm": "120-180",
            "torso_tilt": "0-12",
            "arm_level_difference": "0-0.06",
            "hip_level_difference": "0-0.06",
            "center_offset": "0-0.10",
        },
    ),
}
