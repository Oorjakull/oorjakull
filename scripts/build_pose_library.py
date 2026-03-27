#!/usr/bin/env python3
"""Build pose_library.json from yoga_poses.xlsx.

Usage:
    python scripts/build_pose_library.py [path/to/yoga_poses.xlsx]

Outputs:
    backend/data/pose_library.json
"""
from __future__ import annotations

import json
import sys
from pathlib import Path


def _parse_pipe_list(raw: str | None) -> list[str]:
    """Split a pipe-separated string into a cleaned list."""
    if not raw:
        return []
    return [item.strip() for item in str(raw).split("|") if item.strip()]


def _parse_comma_list(raw: str | None) -> list[str]:
    """Split a comma-separated string into a cleaned list."""
    if not raw:
        return []
    return [item.strip() for item in str(raw).split(",") if item.strip()]


def _parse_mistakes(raw: str | None) -> list[dict[str, str]]:
    """Parse 'mistake->correction|mistake->correction' into structured list."""
    if not raw:
        return []
    result: list[dict[str, str]] = []
    for entry in str(raw).split("|"):
        entry = entry.strip()
        if not entry:
            continue
        if "->" in entry:
            parts = entry.split("->", 1)
            result.append({
                "mistake": parts[0].strip(),
                "correction": parts[1].strip(),
            })
        else:
            # No arrow — treat entire string as mistake with generic correction
            result.append({"mistake": entry, "correction": "Adjust alignment"})
    return result


def build_library(xlsx_path: Path) -> list[dict]:
    try:
        import openpyxl
    except ImportError:
        print("ERROR: openpyxl is required. Install with: pip install openpyxl")
        sys.exit(1)

    wb = openpyxl.load_workbook(str(xlsx_path), read_only=True, data_only=True)
    ws = wb["Sheet1"]

    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        print("ERROR: Sheet1 is empty")
        sys.exit(1)

    headers = [str(h).strip() if h else f"col_{i}" for i, h in enumerate(rows[0])]

    library: list[dict] = []

    for row_idx, row in enumerate(rows[1:], start=2):
        data = {headers[i]: row[i] for i in range(min(len(headers), len(row)))}

        status = str(data.get("status", "")).strip().lower()
        if status != "approved":
            continue

        pose_id = str(data.get("pose_id", "")).strip()
        if not pose_id:
            continue

        hold_raw = data.get("hold_seconds_beginner")
        try:
            hold_seconds = int(hold_raw) if hold_raw else 10
        except (ValueError, TypeError):
            hold_seconds = 10

        # Parse avoid_conditions from "Avoid" column
        avoid_conditions = _parse_comma_list(data.get("Avoid"))

        entry = {
            "pose_id": pose_id,
            "name_en": str(data.get("name_en", "")).strip(),
            "name_sa": str(data.get("name_sa", "")).strip(),
            "difficulty": str(data.get("difficulty", "beginner")).strip().lower(),
            "category": str(data.get("category", "")).strip().lower(),
            "summary": str(data.get("summary", "")).strip(),
            "hold_seconds": hold_seconds,
            "inhale_cue": str(data.get("inhale_cue", "")).strip(),
            "exhale_cue": str(data.get("exhale_cue", "")).strip(),
            "alignment_cues": _parse_pipe_list(data.get("alignment_cues")),
            "common_mistakes": _parse_mistakes(data.get("common_mistakes")),
            "modifications": _parse_pipe_list(data.get("modifications")),
            "contraindications": _parse_pipe_list(data.get("contraindications")),
            "avoid_conditions": avoid_conditions,
            "benefits": _parse_pipe_list(data.get("benefits")),
            "voice_script_short": str(data.get("voice_script_short", "")).strip(),
            "transition_in_ids": _parse_comma_list(data.get("transition_in_ids")),
            "transition_out_ids": _parse_comma_list(data.get("transition_out_ids")),
            "flow_name": str(data.get("Flow Name", "")).strip(),
            "power_yoga": str(data.get("Power Yoga", "No")).strip().lower() == "yes",
        }

        library.append(entry)

    wb.close()
    return library


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    xlsx_path = Path(sys.argv[1]) if len(sys.argv) > 1 else repo_root / "yoga_poses.xlsx"

    if not xlsx_path.exists():
        print(f"ERROR: Excel file not found: {xlsx_path}")
        sys.exit(1)

    library = build_library(xlsx_path)
    print(f"Parsed {len(library)} approved poses from {xlsx_path.name}")

    out_dir = repo_root / "backend" / "data"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "pose_library.json"

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(library, f, indent=2, ensure_ascii=False)

    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
