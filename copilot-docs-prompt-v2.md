# GitHub Copilot Agent Prompt
## OorjaKull — Developer Documentation Site (GitHub Pages)
### Version: OorjaKull-Docs-v2.0 — ZERO ASSUMPTION MODE

---

## THE SINGLE MOST IMPORTANT RULE IN THIS PROMPT

**You must not write a single sentence of documentation content until you have read the file that proves it.**

If you cannot point to a specific file and line number that confirms a fact, you do not document it. You leave a `<!-- SCAN-NEEDED: [what is missing and where to look] -->` comment in its place.

This applies to:
- Component names
- Hook names and signatures
- API endpoint paths, methods, request/response shapes
- Database model fields
- Environment variable names
- State management patterns
- LLM model names
- TTS mechanisms
- Translation function signatures
- Deployment targets
- Any version number
- Any file path

**No exceptions. Not even for things you are confident about.**

---

## WHAT THIS TASK IS

You are building a **GitHub Pages developer documentation website** for the OorjaKull codebase. The site lives in a `docs/` folder at the repo root and is deployed automatically via a GitHub Actions workflow.

The audience is a **new developer** who has never seen this codebase. They need to understand how it works and get it running locally. Everything they read must be accurate. Inaccurate documentation is worse than no documentation.

---

## PHASE 0 — READ THE CODEBASE FIRST
### This phase has no output except comment blocks. Do not create any files yet.

Work through every scan below in order. After each scan, write the findings comment block exactly as shown. If a field cannot be determined from reading files, write `NOT FOUND` — do not guess.

Do not proceed to Phase 1 until every scan is complete and every comment block is written.

---

### SCAN 1 — Repository Layout

**Action:** Run `find . -type f | grep -v node_modules | grep -v .git | grep -v __pycache__ | grep -v dist | grep -v .venv | sort` and read the output in full.

Then open and read:
- Every file at the repo root level
- `package.json` (if present)
- `vite.config.ts` or `vite.config.js` (if present)
- `tsconfig.json` (if present)
- `capacitor.config.ts` or `capacitor.config.json` (if present)
- `requirements.txt` or `pyproject.toml` or `setup.py` (if present)
- `.env.example` or `.env.sample` (if present — do not read `.env`)
- Any `README.md` at repo root or in subdirectories
- Any `.github/workflows/` files

```
// SCAN-1 FINDINGS:
// Monorepo or separate repos: ___
// Frontend root directory: ___
// Backend root directory: ___
// package.json scripts found (list all): ___
// Python entry point file: ___
// Python dependency file and name: ___
// .env.example exists: yes / no
// capacitor.config found: yes / no
// README.md found: yes / no — content summary: ___
// .github/workflows files found (list names): ___
// Any Docker or docker-compose files: ___
// Any other notable root-level config files: ___
```

---

### SCAN 2 — Frontend: Pages and Routing

**Action:** Open the frontend source root. Read:
- The router configuration file (look for `createBrowserRouter`, `BrowserRouter`, `Routes`, or file-based routing config)
- Every file inside `src/pages/` or `src/views/` or wherever page components live
- `App.tsx` or `main.tsx`

For each route/page found, record its exact path string and the component it renders.

```
// SCAN-2 FINDINGS:
// Router library and version (from package.json): ___
// Router config file path: ___
// Routes found (list as: "path" → ComponentName @ filepath):
//   ___
//   ___
// Default/fallback route: ___
// Any auth-protected routes: ___
```

---

### SCAN 3 — Frontend: Components

**Action:** List every file in `src/components/` (or equivalent). For each component file, open it and read:
- The component's exported name
- Its props interface (if TypeScript)
- What it renders (one sentence — describe what you see in the JSX, do not invent)
- Any hooks it calls

Do not describe what a component "probably does" based on its filename. Read the file.

```
// SCAN-3 FINDINGS:
// Components found (list as: ComponentName @ filepath — what it renders):
//   ___
//   ___
// (continue for every component found)
```

---

### SCAN 4 — Frontend: Custom Hooks

**Action:** List every file in `src/hooks/` (or equivalent). For each hook file, open it and read:
- The exported function name
- Every parameter it accepts (name and type)
- What it returns (name and type of every return value)
- What side effects it has (timers, API calls, speech, media, etc.)
- Which other hooks or utilities it calls

```
// SCAN-4 FINDINGS:
// Hooks found (for each):
//   Name: ___
//   File: ___
//   Parameters: ___
//   Returns: ___
//   Side effects: ___
//   Calls: ___
```

---

### SCAN 5 — Frontend: State Management

**Action:** Search for the following and read every file that matches:
- Files named `context`, `store`, `slice`, `state`, `provider` anywhere in `src/`
- Imports of `createContext`, `useContext`, `create` (Zustand), `configureStore` (Redux), `atom` (Jotai/Recoil)
- Any global state declarations

```
// SCAN-5 FINDINGS:
// State management library (if any): ___
// Context providers found (name, file, what state they hold):
//   ___
// Zustand/Redux/other stores found (name, file, what state):
//   ___
// How language preference is stored (exact variable name and file): ___
// How voice preference is stored (exact variable name and file): ___
// How session state is stored (exact variable name and file): ___
```

---

### SCAN 6 — MediaPipe Integration

**Action:** Search for files importing from `@mediapipe/pose` or `@mediapipe/holistic` or containing `Pose(`, `onResults`, `poseLandmarks`, `NormalizedLandmarkList`. Open and read every matching file.

```
// SCAN-6 FINDINGS:
// Files using MediaPipe (list paths): ___
// Model complexity setting (exact value from code): ___
// minDetectionConfidence value: ___
// minTrackingConfidence value: ___
// smoothLandmarks setting: ___
// onResults callback location (file + function name): ___
// Landmark state variable name: ___
// Landmark indices explicitly referenced in code (list index + what it's used for): ___
// visibility threshold value used (if any): ___
// Any angle calculation code found: yes / no — file path if yes: ___
```

---

### SCAN 7 — TTS and Audio

**Action:** Search for `speechSynthesis`, `SpeechSynthesisUtterance`, `AudioContext`, `OscillatorNode`, `playAudio`, `speak`, `playTTS`, and any Groq audio/TTS API calls. Open and read every matching file.

```
// SCAN-7 FINDINGS:
// TTS mechanism found: Web Speech API / Groq TTS / other / none found: ___
// Files using TTS (list paths): ___
// Speech play function name and signature (exact, from code): ___
// Speech stop function name and signature (exact, from code): ___
// Breathwork audio: Web Audio API used: yes / no
// Breathwork audio file path: ___
// Oscillator types used in breathwork (exact values): ___
// Any voice name / voice selection code found: ___
```

---

### SCAN 8 — Translation Pipeline

**Action:** Search for `translate`, `i18n`, `useTranslation`, `getTranslation`, `locale`, any `.json` files that look like translation files (keys → strings), and any API calls to a `/translate` endpoint. Open and read every matching file.

```
// SCAN-8 FINDINGS:
// Translation approach: key-based JSON / API call / library / none found: ___
// Translation function name and signature (exact): ___
// Sync or async: ___
// Translation files found (list paths and language codes): ___
// All translation keys found (list them): ___
// Language codes supported (exact values from code): ___
// How language code is passed to the function: ___
```

---

### SCAN 9 — Groq / LLM Integration

**Action:** Search for `groq`, `Groq(`, `groq-sdk`, `/chat/completions`, `openai` (Groq uses OpenAI-compatible API), any system prompt strings or files, and any `GROQ_API_KEY` environment variable references. Open and read every matching file.

```
// SCAN-9 FINDINGS:
// Groq SDK or REST: ___
// Groq client initialisation file: ___
// Model name used (exact string from code): ___
// System prompt: file path where it lives: ___
// System prompt: is it a static string, template, or loaded from file: ___
// Streaming enabled: yes / no: ___
// Temperature and max_tokens values (exact from code): ___
// Which part of the app calls Groq — frontend / backend / both: ___
// Madhu persona name referenced in code: yes / no: ___
// Any domain guardrail logic found (describe exactly what the code does): ___
```

---

### SCAN 10 — FastAPI Backend

**Action:** Open the backend root. Read every `router` file, every `model` file, the main FastAPI app entry point, and any `service` or `util` files.

For every endpoint, record the exact method, path, request body model, response model, and whether auth is required. Read the actual decorator — do not infer.

```
// SCAN-10 FINDINGS:
// FastAPI entry point file: ___
// All routers registered (file path + prefix): ___
// Endpoints found (for each):
//   METHOD /path — request model — response model — auth: yes/no — description from code comments
//   ___
// Pydantic models found (name, file, fields with types): ___
// Auth mechanism: JWT / session / API key / none found: ___
// Auth middleware file: ___
// CORS configuration: ___
```

---

### SCAN 11 — Database

**Action:** Search for SQLAlchemy, Tortoise ORM, databases library, Prisma, or raw SQL. Open every model file, migration file, and database config file.

```
// SCAN-11 FINDINGS:
// Database type (PostgreSQL / SQLite / MongoDB / other / not found): ___
// ORM or query library: ___
// Database config/connection file: ___
// Models found (for each model):
//   Model name: ___
//   Table name: ___
//   Fields (name, type, constraints — exact from code): ___
//   Relationships: ___
// Migrations tool (Alembic / other / none found): ___
// Migration files location: ___
```

---

### SCAN 12 — Environment Variables

**Action:** Read `.env.example` (or equivalent) in full. Also grep the entire codebase for `process.env.`, `import.meta.env.`, `os.environ`, `os.getenv`, `settings.` and collect every unique variable name referenced.

```
// SCAN-12 FINDINGS:
// All environment variables found (list as: VAR_NAME — used in file — frontend/backend/both):
//   ___
//   ___
// Variables in .env.example but not in code: ___
// Variables in code but not in .env.example: ___
```

---

### SCAN 13 — Developer Setup Commands

**Action:** Read `package.json` scripts section in full. Read the Python dependency file in full. Read any `Makefile` or `justfile` if present. Read `capacitor.config.ts` fully if present.

```
// SCAN-13 FINDINGS:
// Frontend install command (exact): ___
// Frontend dev command (exact): ___
// Frontend build command (exact): ___
// Frontend preview command (exact): ___
// Frontend lint command (exact, if present): ___
// Frontend test command (exact, if present): ___
// Backend install command (exact): ___
// Backend dev/run command (exact): ___
// Node version required (from .nvmrc or engines field or volta): ___
// Python version required (from pyproject.toml or .python-version): ___
// Capacitor sync command (exact): ___
// Android build steps (exact commands if documented): ___
// Default frontend port: ___
// Default backend port: ___
```

---

### SCAN 14 — Session and Health Questionnaire Logic

**Action:** Search for session state management, health questionnaire components/forms, risk profiling logic, and session lifecycle management. Read every matching file.

```
// SCAN-14 FINDINGS:
// Session states found (exact state names from code): ___
// Session state transitions (list: from → event → to): ___
// Health questionnaire component file: ___
// Health questionnaire fields (exact field names and types from code): ___
// Risk profiling logic file: ___
// Risk levels defined (exact values): ___
// How risk level gates session start (exact logic from code): ___
// Session start trigger (what user action / what function call): ___
// Session end trigger: ___
```

---

## PHASE 1 — DOCS SITE STRUCTURE

Only after all 14 scans are complete, create this folder structure:

```
docs/
├── index.html
├── getting-started.html
├── architecture.html
├── frontend.html
├── backend.html
├── ai-llm.html
├── database.html
├── session-flow.html
├── deployment.html
├── contributing.html
├── _config.yml
├── .nojekyll
└── assets/
    ├── style.css
    ├── nav.js
    └── diagrams.js
```

---

## PHASE 2 — DESIGN SYSTEM

`assets/style.css` must implement the following. Do not deviate.

```css
/* OorjaKull Docs — Design System */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg-base:        #0f0f11;
  --bg-surface:     #161618;
  --bg-elevated:    #1e1e21;
  --border:         rgba(139,175,141,0.15);
  --border-strong:  rgba(139,175,141,0.35);
  --sage:           #8BAF8D;
  --sage-dim:       rgba(139,175,141,0.55);
  --terracotta:     #C17D5C;
  --gold:           #D4A96A;
  --text-primary:   #F5F0E8;
  --text-secondary: rgba(245,240,232,0.6);
  --text-muted:     rgba(245,240,232,0.35);
  --code-bg:        #0d0d10;
  --radius:         10px;
  --radius-sm:      6px;
  --sidebar-w:      248px;
  --content-max:    860px;
}

/* Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 15px; }
body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-weight: 300;
  line-height: 1.7;
}

/* Layout */
.layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-w);
  min-height: 100vh;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  position: fixed;
  top: 0; left: 0; bottom: 0;
  overflow-y: auto;
  padding: 0 0 40px;
  z-index: 100;
}
.sidebar-logo {
  padding: 24px 20px 20px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.25rem;
  font-weight: 300;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
  display: block;
  text-decoration: none;
}
.sidebar-logo span { color: var(--sage); }
.sidebar-section {
  padding: 20px 0 4px 20px;
  font-size: .65rem;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.sidebar a {
  display: block;
  padding: 6px 20px;
  font-size: .8rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: color .15s, border-color .15s, background .15s;
}
.sidebar a:hover {
  color: var(--text-primary);
  background: rgba(139,175,141,0.05);
}
.sidebar a.active {
  color: var(--sage);
  border-left-color: var(--sage);
  background: rgba(139,175,141,0.08);
}
.sidebar a.sub {
  padding-left: 32px;
  font-size: .75rem;
}

/* Content */
.content {
  margin-left: var(--sidebar-w);
  padding: 48px 60px 80px;
  max-width: calc(var(--sidebar-w) + var(--content-max));
  width: 100%;
}
.breadcrumb {
  font-size: .7rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 28px;
}
.breadcrumb span { color: var(--sage-dim); }

/* Typography */
h1.page-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.6rem;
  font-weight: 300;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: 12px;
}
p.page-subtitle {
  font-size: .95rem;
  color: var(--text-secondary);
  margin-bottom: 48px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 28px;
}
h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.7rem;
  font-weight: 400;
  color: var(--text-primary);
  margin: 52px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
h3 {
  font-size: .9rem;
  font-weight: 500;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--sage);
  margin: 32px 0 12px;
}
h4 {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-primary);
  margin: 24px 0 8px;
}
p { margin-bottom: 16px; color: var(--text-secondary); }
a { color: var(--sage); text-decoration: none; }
a:hover { text-decoration: underline; }

/* Code blocks */
pre {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-left: 3px solid var(--sage);
  border-radius: var(--radius-sm);
  padding: 20px 20px 20px 24px;
  overflow-x: auto;
  margin: 20px 0;
  position: relative;
}
pre code {
  font-family: 'JetBrains Mono', monospace;
  font-size: .8rem;
  line-height: 1.7;
  color: var(--text-primary);
}
code {
  font-family: 'JetBrains Mono', monospace;
  font-size: .82em;
  background: var(--bg-elevated);
  color: var(--sage);
  padding: 2px 6px;
  border-radius: 4px;
}
pre code { background: none; padding: 0; }

/* Copy button */
.copy-btn {
  position: absolute;
  top: 10px; right: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: .65rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  cursor: pointer;
  transition: color .15s, border-color .15s;
}
.copy-btn:hover { color: var(--sage); border-color: var(--border-strong); }

/* Lang label */
pre[data-lang]::before {
  content: attr(data-lang);
  position: absolute;
  top: 10px; right: 48px;
  font-family: 'JetBrains Mono', monospace;
  font-size: .6rem;
  color: var(--text-muted);
  letter-spacing: .1em;
  text-transform: uppercase;
}

/* Callout boxes */
.callout {
  border-radius: var(--radius);
  padding: 16px 20px;
  margin: 24px 0;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: .85rem;
}
.callout-icon { flex-shrink: 0; font-size: 1rem; margin-top: 2px; }
.callout.info     { background: rgba(139,175,141,0.08); border: 1px solid rgba(139,175,141,0.25); }
.callout.warning  { background: rgba(212,169,106,0.08); border: 1px solid rgba(212,169,106,0.25); }
.callout.danger   { background: rgba(193,125,92,0.08);  border: 1px solid rgba(193,125,92,0.25);  }
.callout.tip      { background: rgba(245,240,232,0.04); border: 1px solid var(--border); }
.callout p { margin: 0; color: var(--text-secondary); }

/* Mermaid wrapper */
.diagram-wrap {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 32px 24px;
  margin: 24px 0;
  overflow-x: auto;
  text-align: center;
}

/* Step cards */
.steps { counter-reset: step; margin: 24px 0; }
.step {
  display: flex;
  gap: 20px;
  margin-bottom: 28px;
  padding: 20px 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--sage);
  border-radius: var(--radius);
}
.step-num {
  counter-increment: step;
  content: counter(step);
  width: 28px; height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(139,175,141,0.15);
  border: 1px solid var(--sage-dim);
  color: var(--sage);
  font-size: .8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}
.step-body h4 { margin: 0 0 8px; }
.step-body p  { margin: 0; font-size: .85rem; }

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: .82rem;
}
th {
  text-align: left;
  padding: 10px 14px;
  font-size: .65rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--sage);
  border-bottom: 1px solid var(--border-strong);
  font-weight: 500;
}
td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
  vertical-align: top;
}
tr:last-child td { border-bottom: none; }
tr:nth-child(even) td { background: rgba(245,240,232,0.02); }

/* Badges */
.badge {
  display: inline-block;
  font-size: .65rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 20px;
  border: 1px solid var(--border-strong);
  color: var(--sage-dim);
  margin: 2px;
}

/* Scan-needed placeholder */
.scan-needed {
  background: rgba(212,169,106,0.08);
  border: 1px dashed rgba(212,169,106,0.4);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  font-size: .8rem;
  color: var(--gold);
  margin: 12px 0;
  font-family: 'JetBrains Mono', monospace;
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); transition: transform .2s; }
  .sidebar.open { transform: translateX(0); }
  .content { margin-left: 0; padding: 24px 20px 60px; }
  .hamburger {
    position: fixed; top: 16px; left: 16px; z-index: 200;
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 8px 10px; cursor: pointer;
    color: var(--text-primary); font-size: 1rem;
  }
}
```

---

## PHASE 3 — SHARED SCRIPTS

### `assets/diagrams.js`

```js
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
  themeVariables: {
    primaryColor:       '#1e1e21',
    primaryTextColor:   '#F5F0E8',
    primaryBorderColor: '#8BAF8D',
    lineColor:          '#8BAF8D',
    secondaryColor:     '#161618',
    tertiaryColor:      '#0f0f11',
    background:         '#0f0f11',
    mainBkg:            '#1e1e21',
    nodeBorder:         '#8BAF8D',
    clusterBkg:         '#161618',
    titleColor:         '#D4A96A',
    edgeLabelBackground:'#1e1e21',
    fontFamily:         'DM Sans, sans-serif',
    fontSize:           '13px',
  },
  flowchart: { curve: 'basis', padding: 20 },
  sequence:  { mirrorActors: false, messageAlign: 'center' },
  er:        { diagramPadding: 20 },
});
```

### `assets/nav.js`

Build the sidebar navigation from the page list below. Active page is detected via `window.location.pathname`. Copy button logic for code blocks is also included here.

```js
const NAV = [
  { label: 'Overview',       href: 'index.html' },
  { section: 'Setup' },
  { label: 'Getting Started', href: 'getting-started.html', sub: true },
  { section: 'Architecture' },
  { label: 'System Architecture', href: 'architecture.html', sub: true },
  { section: 'Codebase' },
  { label: 'Frontend',       href: 'frontend.html',    sub: true },
  { label: 'Backend',        href: 'backend.html',     sub: true },
  { label: 'AI & LLM',       href: 'ai-llm.html',      sub: true },
  { label: 'Database',       href: 'database.html',    sub: true },
  { section: 'Product' },
  { label: 'Session Flow',   href: 'session-flow.html', sub: true },
  { section: 'Operations' },
  { label: 'Deployment',     href: 'deployment.html',  sub: true },
  { label: 'Contributing',   href: 'contributing.html', sub: true },
];

function buildNav() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  const current = window.location.pathname.split('/').pop() || 'index.html';

  let html = `<a class="sidebar-logo" href="index.html">Oorja<span>Kull</span> <small style="font-size:.6rem;color:var(--text-muted);display:block;font-family:'DM Sans',sans-serif;letter-spacing:.1em;text-transform:uppercase">Docs</small></a>`;

  NAV.forEach(item => {
    if (item.section) {
      html += `<div class="sidebar-section">${item.section}</div>`;
    } else {
      const active = current === item.href ? ' active' : '';
      const sub    = item.sub ? ' sub' : '';
      html += `<a href="${item.href}" class="${(active + sub).trim()}">${item.label}</a>`;
    }
  });

  sidebar.innerHTML = html;
}

function buildCopyButtons() {
  document.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.onclick = () => {
      const code = pre.querySelector('code');
      navigator.clipboard.writeText(code ? code.textContent : pre.textContent).then(() => {
        btn.textContent = 'Copied';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    };
    pre.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  buildCopyButtons();
  // Mobile hamburger
  const ham = document.querySelector('.hamburger');
  const sb  = document.getElementById('sidebar');
  if (ham && sb) ham.addEventListener('click', () => sb.classList.toggle('open'));
});
```

---

## PHASE 4 — HTML PAGE TEMPLATE

Every page must use this exact skeleton. Fill `[PAGE-TITLE]`, `[SECTION]`, `[PAGE]`, `[SUBTITLE]` from actual content.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>[PAGE-TITLE] — OorjaKull Docs</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="assets/style.css" />
</head>
<body>
  <button class="hamburger" aria-label="Menu">☰</button>
  <div class="layout">
    <nav class="sidebar" id="sidebar"></nav>
    <main class="content">
      <div class="breadcrumb">[SECTION] <span>/</span> [PAGE]</div>
      <h1 class="page-title">[PAGE-TITLE]</h1>
      <p class="page-subtitle">[SUBTITLE — one sentence, derived from scan findings]</p>
      <div class="page-body">
        <!-- CONTENT GOES HERE — all from scan findings only -->
      </div>
    </main>
  </div>
  <script type="module" src="assets/diagrams.js"></script>
  <script src="assets/nav.js"></script>
</body>
</html>
```

---

## PHASE 5 — PAGE CONTENT RULES

These rules apply to every single page. There are no exceptions.

### The only content rule that matters:

**Every factual statement in the documentation must come from a specific file you read during the scans.**

Before writing any sentence, ask: *"Which file and which line confirms this?"*
If the answer is "I inferred it" or "it's probably" or "typically this kind of app..." — do not write it.
Write this instead:

```html
<div class="scan-needed">
  SCAN NEEDED: [describe exactly what information is missing and which file or pattern to look for]
</div>
```

### What each page must contain (content derived from scans only):

---

#### `index.html`

- Product name and a one-sentence description — **only if a description exists in README or package.json `description` field**
- Tech stack badges — **only list packages found in package.json and requirements.txt**
- "How to navigate these docs" — a brief guide to the sidebar sections
- A system architecture Mermaid diagram — **only draw nodes and connections that you confirmed exist by reading code.** If you are not certain a connection exists, omit it. Label every node with the exact component/service name from the code, not a generic label.
- Links to every other page

---

#### `getting-started.html`

- Prerequisites — **only Node version, Python version, and other tools if explicitly required in the codebase (from .nvmrc, engines field, pyproject.toml, or comments)**
- Clone command — **use the actual repo remote URL if readable from git config, otherwise leave as `<!-- SCAN-NEEDED: repo URL -->`**
- Frontend setup — **exact commands from Scan 13 only**
- Backend setup — **exact commands from Scan 13 only**
- Environment variables table — **every variable from Scan 12, with the description taken from `.env.example` comments if present**
- "Verify it works" checklist — **only include items that are verifiable from what you found (e.g. if Swagger is present at /docs, include that; if not confirmed, omit)**

---

#### `architecture.html`

Mermaid diagrams **built only from confirmed code paths**:

1. **System overview** — every service, module, and external API that you confirmed exists in the code. Draw edges only where you found an actual import, API call, or data flow in code. No assumed edges.

2. **MediaPipe pipeline** — only if MediaPipe code was found in Scan 6. Nodes = actual functions/callbacks found. Edges = actual data flow from code.

3. **Session state machine** — only if session states were found in Scan 14. States = exact state names from code. Transitions = exact transitions found in code.

4. **Request lifecycle** — only document the request path for an endpoint you confirmed exists (pick the most central one from Scan 10).

5. **Frontend component tree** — only components confirmed in Scan 3. Show only parent-child relationships you can confirm from imports or JSX.

**For every diagram:** if a node or edge is uncertain, omit it rather than guessing. A smaller accurate diagram is better than a large inaccurate one.

---

#### `frontend.html`

- Annotated file tree — generated from Scan 1 and 2 actual directory listing
- Routes table — exact paths and component names from Scan 2
- State management — exact library, store names, what state each holds — from Scan 5
- Hooks catalogue — every hook from Scan 4 with exact parameter and return type tables
- MediaPipe section — exact config values from Scan 6, exact landmark indices used
- Breathwork section — only if audio code found in Scan 7; describe only what the code does
- Translation section — only from Scan 8; exact function signature and usage

---

#### `backend.html`

- Annotated backend file tree — from Scan 1
- API reference table — every endpoint from Scan 10, exact fields
- Pydantic models — every model from Scan 10, all fields with exact types
- Auth flow — only if auth was found in Scan 10; describe exactly what the code does
- Environment variables — from Scan 12, backend variables only

---

#### `ai-llm.html`

- Groq integration — only from Scan 9; exact model name, exact call pattern
- Madhu persona — describe the system prompt structure (not the content verbatim) only from what you read in Scan 9
- TTS — exact mechanism from Scan 7
- MediaPipe — exact config from Scan 6, landmark indices table
- Translation pipeline — exact from Scan 8

---

#### `database.html`

- Only populate this page if a database was found in Scan 11
- If no database found: write one paragraph saying no database layer was found during scan, and add a `<div class="scan-needed">` block
- If found: ER diagram from Scan 11 model fields only — no assumed relationships
- Models reference table — every field with exact type and constraints from code

---

#### `session-flow.html`

- Only document session states that were found in Scan 14
- Health questionnaire — only fields found in Scan 14
- If session state machine code was not found: `<div class="scan-needed">` for each missing section

---

#### `deployment.html`

- Only document deployment targets confirmed in Scan 1 (from workflow files, config files, README)
- Capacitor section — only if `capacitor.config.ts` was found and read
- CI/CD — only document workflows found in `.github/workflows/`
- Do not document Vercel, AWS, Railway, or any other platform unless confirmed in code/config

---

#### `contributing.html`

- Git workflow — document the branch structure only if inferable from existing branch names or README
- Commit format — only if a commitlint config, CONTRIBUTING.md, or commit history pattern was found
- Code style — only ESLint/Prettier/Black/Ruff config found in Scan 1
- OorjaKull-specific conventions documented in prompts or code comments — list only what you find with `// OORJAKULL-FALLBACK` or similar markers
- Additive-only policy — document only if mentioned in code comments or README

---

## PHASE 6 — GITHUB PAGES CONFIG

### `docs/_config.yml`
```yaml
# GitHub Pages — static HTML, Jekyll disabled
exclude: ['**']
include: ['.nojekyll']
```

### `docs/.nojekyll`
Empty file.

### `.github/workflows/docs.yml`

**Only create this file if no existing docs workflow was found in Scan 1.**
If a workflow already exists, read it and document it on `deployment.html` instead of creating a new one.

```yaml
name: Deploy Docs to GitHub Pages

on:
  push:
    branches: [main]
    paths: ['docs/**']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './docs'
      - uses: actions/deploy-pages@v4
        id: deployment
```

---

## PHASE 7 — GIT COMMIT AND PUSH

After all files are created and verified:

```bash
git add docs/ .github/workflows/docs.yml
git commit -m "docs: add GitHub Pages developer documentation site

Scan-verified documentation — all content derived from codebase reads.
SCAN-NEEDED placeholders mark sections requiring manual completion."
git push origin main
```

---

## STRICT GUARDRAILS — FINAL SUMMARY

### 🔴 ABSOLUTE NEVERS
- Never write a component name you did not read in a file
- Never write an API endpoint you did not find in a router decorator
- Never write a database field you did not find in a model definition
- Never write an env var name you did not find in `.env.example` or grep results
- Never write a Mermaid diagram node you cannot trace to a real file
- Never write a Mermaid diagram edge you cannot trace to a real import or API call
- Never write version numbers you did not read in a config file
- Never write "this app uses X" unless you found X in package.json, requirements.txt, or an import statement
- Never use placeholder or lorem ipsum text

### 🟡 ALWAYS
- Scan comment blocks must be written before any HTML file is created
- Every `<div class="scan-needed">` must describe specifically what is missing and where to look
- All Mermaid diagram code must be inside `<pre class="mermaid">` tags, inside a `<div class="diagram-wrap">`
- All code blocks must have a `data-lang` attribute matching the language
- All pages must include `diagrams.js` and `nav.js`
- Cross-link pages by actual section names found in the content

---

## VERIFICATION CHECKLIST

Before pushing, confirm:

- [ ] All 14 scan comment blocks written — no `___` fields left blank (either filled or marked `NOT FOUND`)
- [ ] Zero invented content — every sentence traces to a scan finding
- [ ] `SCAN-NEEDED` divs present wherever information was not found
- [ ] All Mermaid diagrams validated at https://mermaid.live before pushing
- [ ] `assets/style.css` — all CSS variables defined, copy buttons work, mobile sidebar works
- [ ] `assets/nav.js` — sidebar active state correct on every page
- [ ] `assets/diagrams.js` — Mermaid theme variables applied
- [ ] `.nojekyll` file present in `docs/`
- [ ] GitHub Actions workflow present (or existing one documented)
- [ ] Git commit pushed with descriptive message

---

*Prompt version: OorjaKull-Docs-v2.0 — Zero Assumption Mode | Authored for GitHub Copilot Agent mode*
