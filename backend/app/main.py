from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.contracts import EvaluateRequest, GeminiAlignmentResponse
from app.services.evaluator import AlignmentEvaluator

app = FastAPI(title="Yoga GenAI POC", version="0.1.0")

# POC: allow local dev frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

evaluator = AlignmentEvaluator()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/evaluate", response_model=GeminiAlignmentResponse)
def evaluate(req: EvaluateRequest) -> dict:
    landmarks = [lm.model_dump() for lm in req.landmarks]
    return evaluator.evaluate(
        client_id=req.client_id,
        expected_pose=req.expected_pose,
        user_level=req.user_level,
        landmarks=landmarks,
    )
