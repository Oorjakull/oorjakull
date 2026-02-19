from __future__ import annotations

import sys
import json
from pathlib import Path

# Ensure backend/ is on sys.path so `import app...` works regardless of cwd.
_BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.ai.groq_client import GroqClient
from app.core.config import settings
from app.models.contracts import GeminiAlignmentResponse


def main() -> None:
    if not settings.groq_api_key:
        raise SystemExit(
            "GROQ_API_KEY is not set. Set it via backend/.env or $env:GROQ_API_KEY, then re-run."
        )

    client = GroqClient()

    biomech_summary = {
        "expected_pose": "Warrior II",
        "user_level": "beginner",
        "angles": {
            "front_knee": 170.0,
            "back_knee": 175.0,
            "left_arm": 160.0,
            "right_arm": 162.0,
            "torso_tilt": 4.0,
        },
        "symmetry": {"arm_level_difference": 0.01, "hip_level_difference": 0.01},
        "stability": {"center_offset": 0.02},
        "ideal_ranges": {
            "front_knee": "85-115",
            "back_knee": "165-180",
            "left_arm": "165-180",
            "right_arm": "165-180",
            "torso_tilt": "0-10",
            "arm_level_difference": "0-0.05",
            "hip_level_difference": "0-0.05",
            "center_offset": "0-0.08",
        },
    }

    try:
        raw = client.evaluate_alignment(biomech_summary)
        validated = GeminiAlignmentResponse.model_validate(raw).model_dump()
    except Exception as e:
        msg = str(e)
        if "RESOURCE_EXHAUSTED" in msg or "Quota exceeded" in msg or "quota" in msg.lower() or "rate" in msg.lower():
            raise SystemExit(
                "Groq API returned quota/rate limit error. Try again later or check your Groq plan/limits, then retry."
            )
        raise

    print("groq_model=", settings.groq_model)
    print(json.dumps(validated, indent=2))


if __name__ == "__main__":
    main()
