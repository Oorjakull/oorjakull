from __future__ import annotations

import json
from typing import Any

from app.core.config import settings
from app.ai.prompt import SYSTEM_PROMPT, USER_INSTRUCTIONS


class GeminiClient:
    def __init__(self) -> None:
        self._client: Any | None = None
        self._mode: str | None = None
        self._genai_mod: Any | None = None
        self._genai2_mod: Any | None = None

        # Prefer google-genai; fallback to google-generativeai.
        # IMPORTANT: do not require an API key at import/startup time.
        # We'll initialize the actual client lazily on first call.
        try:
            from google import genai  # type: ignore

            self._mode = "google-genai"
            self._genai_mod = genai
        except Exception:
            try:
                import google.generativeai as genai2  # type: ignore

                self._mode = "google-generativeai"
                self._genai2_mod = genai2
            except Exception as e:
                raise RuntimeError(
                    "Gemini client libraries not available. Install google-genai (preferred) "
                    "or google-generativeai."
                ) from e

    def _ensure_client(self) -> None:
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")

        if self._client is not None:
            return

        if self._mode == "google-genai":
            # google-genai: client is an object instance.
            self._client = self._genai_mod.Client(api_key=settings.gemini_api_key)
            return

        if self._mode == "google-generativeai":
            # google-generativeai: module-level configure + GenerativeModel.
            self._genai2_mod.configure(api_key=settings.gemini_api_key)
            self._client = self._genai2_mod
            return

        raise RuntimeError("Gemini client mode not available")

    def evaluate_alignment(self, biomech_summary: dict[str, Any]) -> dict[str, Any]:
        self._ensure_client()

        payload_text = json.dumps(biomech_summary, separators=(",", ":"), ensure_ascii=False)

        if self._mode == "google-genai":
            # google-genai supports response_mime_type in many environments.
            from google.genai import types  # type: ignore

            resp = self._client.models.generate_content(
                model=settings.gemini_model,
                contents=[
                    types.Content(
                        role="user",
                        parts=[
                            types.Part(text=USER_INSTRUCTIONS + "\nBiomechanical data:\n" + payload_text)
                        ],
                    )
                ],
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=settings.gemini_temperature,
                    response_mime_type="application/json",
                ),
            )
            text = (resp.text or "").strip()
        else:
            model = self._client.GenerativeModel(
                model_name=settings.gemini_model,
                system_instruction=SYSTEM_PROMPT,
                generation_config={
                    "temperature": settings.gemini_temperature,
                    "response_mime_type": "application/json",
                },
            )
            resp = model.generate_content(USER_INSTRUCTIONS + "\nBiomechanical data:\n" + payload_text)
            text = (getattr(resp, "text", "") or "").strip()

        # Robust JSON parse: try direct, else extract first JSON object.
        try:
            return json.loads(text)
        except Exception:
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                return json.loads(text[start : end + 1])
            raise
