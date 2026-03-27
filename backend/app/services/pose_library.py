"""Load and cache pose_library.json at startup.

Call ``get_library()`` or ``get_pose(pose_id)`` to access the data — never re-reads disk.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any


_LIBRARY: list[dict[str, Any]] = []
_LOOKUP: dict[str, dict[str, Any]] = {}
_LOADED = False


def _load() -> None:
    global _LIBRARY, _LOOKUP, _LOADED
    if _LOADED:
        return

    json_path = Path(__file__).resolve().parents[1] / "data" / "pose_library.json"
    if not json_path.exists():
        _LOADED = True
        return

    with open(json_path, encoding="utf-8") as f:
        _LIBRARY = json.load(f)

    _LOOKUP = {p["pose_id"]: p for p in _LIBRARY}
    _LOADED = True


def get_library() -> list[dict[str, Any]]:
    """Return the full list of approved poses."""
    _load()
    return _LIBRARY


def get_pose(pose_id: str) -> dict[str, Any] | None:
    """Look up a single pose by id. Returns None if not found."""
    _load()
    return _LOOKUP.get(pose_id)


def check_pose_contraindications(
    pose: dict[str, Any],
    user_conditions: list[str],
) -> list[str]:
    """Return warnings if user conditions overlap with pose's avoid_conditions.

    Example: user has "knee pain" → pose "warrior_ii" has "Knee injury" → warn.
    """
    warnings: list[str] = []
    avoid_conditions = pose.get("avoid_conditions", [])
    modifications = pose.get("modifications", [])

    for condition in user_conditions:
        for avoid in avoid_conditions:
            if condition.lower() in avoid.lower() or avoid.lower() in condition.lower():
                mod_text = modifications[0] if modifications else "reduce intensity"
                warnings.append(
                    f"Note: {pose.get('name_en', pose.get('pose_id'))} may not be suitable "
                    f"for {condition}. Consider: {mod_text}."
                )
    return warnings
