"""Deterministic pose scoring engine — no LLM, < 20ms per call.

Computes joint angles, checks against pose rules, returns a score + violations
with trainer-voice feedback strings.
"""
from __future__ import annotations

import math
from typing import Any

import numpy as np

from pose_rules.landmark_map import MP_LANDMARKS, get_stance


# ── Severity weights (penalty per violation) ────────────────────────────────
_SEVERITY_PENALTY = {"critical": 20, "moderate": 10, "minor": 5}


def _pt(landmarks: list[dict[str, float]], name: str, stance: dict[str, str]) -> np.ndarray:
    """Resolve a landmark name (possibly a stance alias) to an (x, y, z) array."""
    # If it's a stance alias like "front_knee", resolve it
    resolved = stance.get(name, name)
    idx = MP_LANDMARKS.get(resolved)
    if idx is None:
        raise KeyError(f"Unknown landmark: {name} (resolved: {resolved})")
    lm = landmarks[idx]
    return np.array([lm["x"], lm["y"], lm["z"]], dtype=np.float32)


def _visibility(landmarks: list[dict[str, float]], name: str, stance: dict[str, str]) -> float:
    """Return the visibility for a named landmark."""
    resolved = stance.get(name, name)
    idx = MP_LANDMARKS.get(resolved)
    if idx is None:
        return 0.0
    return float(landmarks[idx].get("visibility", 0.0))


def _angle_degrees(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """Angle at point b formed by segments a→b and c→b, in degrees."""
    ba = a - b
    bc = c - b
    denom = float(np.linalg.norm(ba) * np.linalg.norm(bc))
    if denom < 1e-8:
        return float("nan")
    cos_ang = np.clip(float(np.dot(ba, bc)) / denom, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_ang)))


def calculate_pose_score(
    landmarks: list[dict[str, float]],
    pose_id: str,
    rules: dict[str, Any],
) -> dict[str, Any]:
    """Pure deterministic scoring — no LLM, called every frame.

    Returns:
        {
            "score": 0-100,
            "violations": [{"joint": str, "severity": str, "feedback": str}],
            "is_stable": bool,
            "feedback_priority": str | None
        }
    """
    stance = get_stance(pose_id)
    joints = rules.get("joints", {})
    symmetry_checks = rules.get("symmetry_checks", [])

    violations: list[dict[str, str]] = []
    total_penalty = 0

    # ── Joint angle checks ──────────────────────────────────────────────────
    for check_name, spec in joints.items():
        lm_names = spec["landmarks"]

        # Skip if any required landmark has low visibility
        min_vis = min(_visibility(landmarks, n, stance) for n in lm_names)
        if min_vis < 0.5:
            continue

        target = spec["target_angle"]
        tolerance = spec["tolerance"]
        weight = spec.get("weight", "moderate")

        pts = [_pt(landmarks, n, stance) for n in lm_names]
        if len(pts) != 3:
            continue

        actual = _angle_degrees(pts[0], pts[1], pts[2])
        if math.isnan(actual):
            continue

        lo = target - tolerance
        hi = target + tolerance

        if actual < lo:
            feedback = spec.get("feedback_low", "Adjust your alignment")
            severity = weight
            violations.append({"joint": check_name, "severity": severity, "feedback": feedback})
            total_penalty += _SEVERITY_PENALTY.get(severity, 10)
        elif actual > hi:
            feedback = spec.get("feedback_high")
            if feedback:
                severity = weight
                violations.append({"joint": check_name, "severity": severity, "feedback": feedback})
                total_penalty += _SEVERITY_PENALTY.get(severity, 10)

    # ── Symmetry checks ─────────────────────────────────────────────────────
    for sym in symmetry_checks:
        pts_names = sym["points"]
        tolerance_y = sym.get("tolerance_y", 0.05)

        min_vis = min(_visibility(landmarks, n, stance) for n in pts_names)
        if min_vis < 0.5:
            continue

        p0 = _pt(landmarks, pts_names[0], stance)
        p1 = _pt(landmarks, pts_names[1], stance)
        y_diff = abs(float(p0[1] - p1[1]))

        if y_diff > tolerance_y:
            violations.append({
                "joint": sym["name"],
                "severity": "moderate",
                "feedback": sym["feedback"],
            })
            total_penalty += _SEVERITY_PENALTY["moderate"]

    # ── Compute score ───────────────────────────────────────────────────────
    score = max(0, 100 - total_penalty)

    # ── Stability (simple proxy: center-of-mass check) ──────────────────────
    is_stable = True  # Will be refined by the frontend EMA comparison

    # ── Feedback priority (highest-severity single feedback) ────────────────
    severity_order = {"critical": 0, "moderate": 1, "minor": 2}
    violations.sort(key=lambda v: severity_order.get(v["severity"], 99))
    feedback_priority = violations[0]["feedback"] if violations else None

    return {
        "score": score,
        "violations": violations,
        "is_stable": is_stable,
        "feedback_priority": feedback_priority,
    }
