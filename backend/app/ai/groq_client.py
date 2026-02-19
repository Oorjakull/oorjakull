from __future__ import annotations

import json
from typing import Any

from app.ai.prompt import SYSTEM_PROMPT, USER_INSTRUCTIONS
from app.core.config import settings


class GroqClient:
    def __init__(self) -> None:
        try:
            from groq import Groq  # type: ignore

            self._Groq = Groq
        except Exception as e:  # pragma: no cover
            raise RuntimeError("Groq client library not available. Install the 'groq' package.") from e

        self._client: Any | None = None

    def _ensure_client(self) -> None:
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not set")
        if self._client is None:
            self._client = self._Groq(api_key=settings.groq_api_key)

    def evaluate_alignment(self, biomech_summary: dict[str, Any]) -> dict[str, Any]:
        self._ensure_client()

        payload_text = json.dumps(biomech_summary, separators=(",", ":"), ensure_ascii=False)
        user_text = USER_INSTRUCTIONS + "\nBiomechanical data:\n" + payload_text

        # Prefer structured JSON if supported by the API; fallback to plain text.
        try:
            resp = self._client.chat.completions.create(
                model=settings.groq_model,
                temperature=settings.groq_temperature,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_text},
                ],
                response_format={"type": "json_object"},
            )
        except TypeError:
            resp = self._client.chat.completions.create(
                model=settings.groq_model,
                temperature=settings.groq_temperature,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_text},
                ],
            )

        text = (((resp.choices or [None])[0]).message.content if resp and resp.choices else "") or ""
        text = text.strip()

        # Robust JSON parse: try direct, else extract first JSON object.
        try:
            return json.loads(text)
        except Exception:
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                return json.loads(text[start : end + 1])
            raise
