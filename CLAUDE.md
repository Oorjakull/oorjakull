# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OorjaKull** — an AI instructor-led yoga app. Users do poses in front of their webcam; MediaPipe Pose runs in-browser to extract landmarks, which are sent to a FastAPI backend for LLM-powered feedback and safety-filtered session planning. Deployable as a web SPA (Vercel) or Android app (Capacitor).

---

## Commands

### Frontend (`frontend/`)

```bash
npm install              # install deps
npm run dev              # dev server on port 5173
npm run build            # tsc -b && vite build
npm run preview          # preview production build
npm run build:android    # vite build && npx cap sync android
npm run open:android     # open Android Studio
npm run cap:sync         # Capacitor sync only
```

Type-check without building (closest thing to a "test"):
```bash
cd frontend && npx tsc --noEmit
```

### Backend (`backend/`)

```bash
pip install -r backend/requirements.txt

# Run dev server (from repo root)
python -m uvicorn app.main:app --app-dir backend --reload --port 8000

# Smoke tests
python verify_integration.py   # no server needed — validates imports + Pydantic models
python test_assistant.py        # requires server running on port 8000
```

No pytest suite exists yet.

---

## Architecture

### Session State Machine (frontend)

`App.tsx` owns the entire session lifecycle as a linear phase enum:

```
welcome → landing → disclaimer → health-check → session-briefing
→ intro → framing → evaluating → results → sequence-complete → breathwork-session
```

All pose detection (MediaPipe) runs **in the browser**. Extracted landmarks are POSTed to the backend — no server-side video processing.

### Two-Tier Pose Scoring

There are two intentionally separate scoring paths:

| Path | Endpoint | Cost | Cadence |
|---|---|---|---|
| Deterministic | `POST /api/pose/score` | free | every video frame |
| LLM feedback | `POST /api/evaluate` | 1 credit | on demand |

`pose_rules/angle_rules.py` + `angle_calculator.py` handle the deterministic path (<20 ms). `app/services/evaluator.py` (`AlignmentEvaluator`) handles LLM scoring via Groq (default) or Gemini.

### Two-LLM Setup

- **Groq** (`llama-3.3-70b-versatile`) — primary, used for speed in `AlignmentEvaluator` and the assistant
- **Gemini** (`gemini-2.5-pro`) — alternative evaluator + Google Cloud TTS

Both clients are in `backend/app/ai/`. Which model is used is controlled by env vars in `backend/app/core/config.py` (`Settings`).

### Safety / Credits Flow

1. User fills health questionnaire → `POST /api/safety/profile` → `safety/safety_profiler.py` builds `UserRiskProfile` (stored in Supabase `user_risk_profiles`)
2. Session plan filtered against user risk tier → `POST /api/session/plan` via `session/session_orchestrator.py`
3. Each LLM evaluation deducts 1 credit via a Supabase RPC `deduct_credit(p_user_id)`. Free users start with 20.

### Backend Layout

```
backend/
├── app/
│   ├── main.py            # FastAPI app + routes
│   ├── ai/                # groq_client.py, gemini_client.py, prompt.py
│   ├── core/              # config.py (Settings), auth.py (Google JWT), db.py (Supabase)
│   ├── models/contracts.py
│   ├── pose/              # biomechanics.py, templates.py
│   ├── routers/breathwork.py
│   └── services/          # evaluator.py, assistant.py, pose_library.py
├── safety/                # safety_profiler.py, risk_scoring_engine.py, condition_pose_map.py
├── session/session_orchestrator.py
├── pose_rules/            # angle_calculator.py, angle_rules.py, landmark_map.py
├── data/pose_library.json
└── api/index.py           # Vercel serverless entrypoint
```

### Frontend Layout

```
frontend/src/
├── App.tsx                # session state machine
├── api/client.ts          # all backend API calls
├── api/baseUrl.ts         # resolves backend URL (env > localhost > prod)
├── components/            # 30+ UI components (camera, instructor, chatbot, overlays…)
├── contexts/SafetyContext.tsx
├── hooks/                 # useVoiceGuide, useVoiceCommand, useCredits, useChatStore…
├── pages/                 # AccountScreen, BreathworkPage, BreathworkSession
├── poses/reference.ts
└── data/                  # poseDescriptions.ts, sequences.ts
```

### Deployment

| Layer | Platform | Entry |
|---|---|---|
| Frontend | Vercel static | SPA rewrites via `frontend/vercel.json` |
| Backend | Vercel Python serverless | `backend/api/index.py` (routes all `/api/*`) |
| Android | Capacitor | `com.oorjakull.app` — `androidScheme: 'https'` required for Google OAuth |

Production URLs: frontend `oorjakull.com` / `oorjakull-six.vercel.app`, backend `oorjakull-backend.vercel.app`.

---

## Environment Variables

### Backend (`backend/.env`, see `backend/.env.example`)

```
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=          # also used as GOOGLE_TTS_API_KEY fallback
GEMINI_MODEL=gemini-2.5-pro
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GOOGLE_CLIENT_ID=        # backend JWT verification
CORS_ORIGINS=            # CSV of allowed origins
```

### Frontend (`frontend/.env.local`)

```
VITE_API_BASE_URL=       # backend URL; omit to use localhost:8000 in dev
VITE_GOOGLE_CLIENT_ID=
```

---

## Key Constraints

- **TypeScript strictness**: `noUnusedLocals` and `noUnusedParameters` are enforced — the build (`tsc -b`) will fail if unused variables exist.
- **Root `package.json`** is a minimal stub (Tailwind + Framer-Motion devDeps only). All meaningful scripts are in `frontend/package.json`.
- **Android build** requires Android Studio to be installed locally.
- **`frontend/.env.local`** is gitignored and contains real OAuth credentials — never commit it.
