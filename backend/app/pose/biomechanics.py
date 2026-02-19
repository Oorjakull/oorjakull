from __future__ import annotations

import math
from typing import NamedTuple

import numpy as np


class Metrics(NamedTuple):
    angles: dict[str, float]
    symmetry: dict[str, float]
    stability: dict[str, float]
    visibility_mean: float


# MediaPipe Pose landmark indices
L_SHOULDER = 11
R_SHOULDER = 12
L_ELBOW = 13
R_ELBOW = 14
L_WRIST = 15
R_WRIST = 16
L_HIP = 23
R_HIP = 24
L_KNEE = 25
R_KNEE = 26
L_ANKLE = 27
R_ANKLE = 28


def _angle_degrees(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    # angle at b formed by points a-b-c
    ba = a - b
    bc = c - b
    denom = (np.linalg.norm(ba) * np.linalg.norm(bc))
    if denom == 0:
        return float("nan")
    cosang = np.clip(np.dot(ba, bc) / denom, -1.0, 1.0)
    return float(np.degrees(np.arccos(cosang)))


def _midpoint(p: np.ndarray, q: np.ndarray) -> np.ndarray:
    return (p + q) / 2.0


def compute_metrics(landmarks: list[dict[str, float]], expected_pose: str) -> Metrics:
    # Use x,y only for robustness in a front-view POC
    pts = np.array([[lm["x"], lm["y"], lm["z"]] for lm in landmarks], dtype=np.float32)
    vis = np.array([lm.get("visibility", 0.0) for lm in landmarks], dtype=np.float32)

    visibility_mean = float(np.mean(vis))

    # Conventions:
    # - For Warrior II template, assume LEFT is the front (bent) knee.
    # - For Tadasana, both knees should be straight.
    # - For Tree Pose, LEFT knee is standing (front_knee) and RIGHT knee is lifted (back_knee).
    if expected_pose == "Warrior II":
        front_knee_idx = L_KNEE
        front_hip_idx = L_HIP
        front_ankle_idx = L_ANKLE
        back_knee_idx = R_KNEE
        back_hip_idx = R_HIP
        back_ankle_idx = R_ANKLE
    elif expected_pose == "Tree Pose":
        front_knee_idx = L_KNEE
        front_hip_idx = L_HIP
        front_ankle_idx = L_ANKLE
        back_knee_idx = R_KNEE
        back_hip_idx = R_HIP
        back_ankle_idx = R_ANKLE
    else:  # Tadasana
        front_knee_idx = L_KNEE
        front_hip_idx = L_HIP
        front_ankle_idx = L_ANKLE
        back_knee_idx = R_KNEE
        back_hip_idx = R_HIP
        back_ankle_idx = R_ANKLE

    front_knee = _angle_degrees(pts[front_hip_idx], pts[front_knee_idx], pts[front_ankle_idx])
    back_knee = _angle_degrees(pts[back_hip_idx], pts[back_knee_idx], pts[back_ankle_idx])

    left_arm = _angle_degrees(pts[L_SHOULDER], pts[L_ELBOW], pts[L_WRIST])
    right_arm = _angle_degrees(pts[R_SHOULDER], pts[R_ELBOW], pts[R_WRIST])

    hips_mid = _midpoint(pts[L_HIP], pts[R_HIP])
    shoulders_mid = _midpoint(pts[L_SHOULDER], pts[R_SHOULDER])
    torso_vec = shoulders_mid - hips_mid
    # angle from vertical (0 is upright). Vertical axis in image coordinates is (0, -1)
    vertical = np.array([0.0, -1.0, 0.0], dtype=np.float32)
    denom = float(np.linalg.norm(torso_vec) * np.linalg.norm(vertical))
    if denom == 0:
        torso_tilt = float("nan")
    else:
        torso_tilt = float(
            np.degrees(
                np.arccos(
                    np.clip(float(np.dot(torso_vec, vertical)) / denom, -1.0, 1.0)
                )
            )
        )

    arm_level_difference = float(abs(pts[L_WRIST][1] - pts[R_WRIST][1]))
    hip_level_difference = float(abs(pts[L_HIP][1] - pts[R_HIP][1]))

    center_offset = float(abs(hips_mid[0] - 0.5))

    angles = {
        "front_knee": float(front_knee),
        "back_knee": float(back_knee),
        "left_arm": float(left_arm),
        "right_arm": float(right_arm),
        "torso_tilt": float(torso_tilt),
    }

    symmetry = {
        "arm_level_difference": arm_level_difference,
        "hip_level_difference": hip_level_difference,
    }

    stability = {"center_offset": center_offset}

    return Metrics(angles=angles, symmetry=symmetry, stability=stability, visibility_mean=visibility_mean)


def metrics_distance(a: Metrics, b: Metrics) -> float:
    # max absolute difference across numeric fields; unit mix is acceptable for gating
    diffs: list[float] = []
    for k in a.angles:
        diffs.append(abs(a.angles[k] - b.angles[k]))
    for k in a.symmetry:
        diffs.append(abs(a.symmetry[k] - b.symmetry[k]))
    for k in a.stability:
        diffs.append(abs(a.stability[k] - b.stability[k]))
    return float(max(diffs) if diffs else 0.0)


def round_for_summary(metrics: Metrics) -> dict[str, object]:
    # Keep it compact and stable for hashing/caching
    def r(v: float) -> float:
        if math.isnan(v) or math.isinf(v):
            return float("nan")
        return float(round(v, 1))

    return {
        "angles": {k: r(v) for k, v in metrics.angles.items()},
        "symmetry": {k: float(round(v, 4)) for k, v in metrics.symmetry.items()},
        "stability": {k: float(round(v, 4)) for k, v in metrics.stability.items()},
    }
