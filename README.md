<div align="center">

# VibeSync Pro

### AI Video-to-Music Pipeline

Upload a video, get a matched soundtrack. The AI analyzes your video's mood, pacing, and energy — then generates music that fits.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vertex AI](https://img.shields.io/badge/Lyria--002-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/vertex-ai)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

<!-- Replace with actual demo GIF/video -->
<!-- ![Demo](docs/demo.gif) -->

[How It Works](#how-it-works) · [Architecture](#architecture) · [Setup](#getting-started)

</div>

---

## How It Works

```
Upload ──> Gemini Analysis ──> Lyria Generation ──> Smart Merge ──> Export
```

### 1. Video Analysis (Gemini 2.5 Flash)

The video gets uploaded to Gemini via the File API. A structured output schema enforces the response format:

```python
class VideoAnalysis:
    primary_prompt: str          # Music generation prompt (<1500 chars)
    avoid_prompt: str            # What to exclude
    bpm: int                     # Detected tempo
    key: str                     # Musical key
    segments: list[VideoSegment] # 3-6 temporal energy segments
    audio_profile: AudioProfile  # Speech/ambient/silent detection
    reasoning: str               # AI's analysis reasoning
    style_suggestions: list[StyleSuggestion]  # 2 alternative directions
```

Each `VideoSegment` maps a time range to an energy level (`calm`, `building`, `intense`, `peak`, `fading`) with a mood and musical suggestion. These segments drive the volume curves during merge.

The `audio_profile` detects whether the video contains speech, ambient sound, or silence — this determines how the final mix behaves (e.g. music ducks during speech).

### 2. Human-in-the-Loop

After analysis, the user sees:
- The AI-generated music prompt (editable)
- BPM slider
- Detected segments with timestamps and energy levels
- AI reasoning (collapsible)

The user can tweak everything or just hit Generate.

### 3. Music Generation (Vertex AI Lyria-002)

Three variations are generated in parallel:
- **Original** — the base prompt from Gemini's analysis
- **Style 1 & 2** — AI-suggested contrasting styles (e.g. "Reimagine as smooth jazz", "Transform into synthwave")

If Gemini doesn't return style suggestions, hardcoded fallbacks are used (Lo-fi, Upbeat Electronic).

Lyria's recitation filter blocks ~10-20% of generations (too similar to existing content). The retry logic handles this with up to 4 attempts, appending a different style modifier each time via deterministic rotation.

Output: 48kHz, 16-bit PCM WAV, up to ~30 seconds.

### 4. Smart Merge (ffmpeg)

The merge pipeline uses LUFS (Loudness Units relative to Full Scale) — the same loudness standard used by Netflix, Spotify, and YouTube:

```
1. Measure LUFS of video audio        → e.g. -17.6 LUFS
2. Measure LUFS of generated music    → e.g. -24.3 LUFS
3. Calculate dB offset                → target = video_lufs + mode_offset
4. Apply sidechain compression        → music ducks on speech, rebounds in silence
5. Apply segment volume curve         → calm sections quieter, peaks louder
6. Fade-in/out                        → smooth transitions
7. Export MP4
```

**Sidechain compression** works on the actual audio signal, not on AI-estimated timestamps. When the video audio amplitude exceeds the threshold, the music volume is reduced in real-time. Attack: 150ms, release: 600ms, ratio: 3.5 — tuned for social media content where music needs to be prominent but speech must stay clear.

---

## Architecture

```
Frontend (Next.js 16)                    Backend (FastAPI)                External
─────────────────────                    ────────────────                 ────────
VideoUpload.tsx      ── POST /analyze ──> gemini.py ──────────────────> Gemini 2.5 Flash
AnalysisResult.tsx   ── POST /generate ─> lyria.py  ──────────────────> Vertex AI Lyria-002
VariationPicker.tsx  ── POST /merge ────> merge.py  ──────────────────> ffmpeg (local)
LoadingState.tsx                          credits.py ─────────────────> Supabase (Postgres)
```

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 16, React 19, Tailwind 4 |
| **Backend** | FastAPI, Python 3.12, Pydantic |
| **Video Analysis** | Gemini 2.5 Flash — structured JSON output via `response_schema` |
| **Music Generation** | Vertex AI Lyria-002 — `us-central1` endpoint, Application Default Credentials |
| **Audio Processing** | ffmpeg — LUFS measurement (`loudnorm`), sidechain (`sidechaincompress`), format conversion |
| **Database** | Supabase (Postgres) — credits table with Row Level Security |

### Backend Structure

```
backend/app/
├── api/
│   ├── video.py            # POST /api/video/analyze — accepts multipart video
│   ├── music.py            # POST /api/music/generate-variations
│   │                       # POST /api/music/merge
│   │                       # GET  /api/music/download/{filename}
│   └── credits.py          # Credit balance + management
├── services/
│   ├── gemini.py           # File API upload, structured output, style suggestions
│   ├── lyria.py            # 3 parallel generations, retry with modifier rotation
│   ├── merge.py            # LUFS measurement, sidechain, segment curves, fade
│   └── credits.py          # Supabase queries, in-memory fallback for dev
├── models/
│   ├── schemas.py          # All Pydantic request/response models
│   └── database.py         # Supabase client singleton
├── config.py               # Pydantic BaseSettings from env vars
└── main.py                 # FastAPI app, CORS, router registration
```

### Frontend Structure

```
frontend/src/
├── app/
│   ├── page.tsx            # State machine: upload → analyzing → edit → generating → pick → merging → done
│   ├── layout.tsx          # Geist font, dark mode, metadata
│   └── globals.css         # Design system: aurora background, glass cards, animations
├── components/
│   ├── VideoUpload.tsx     # Drag & drop with animated border, feature pills
│   ├── AnalysisResult.tsx  # Two-column: video preview + prompt editor with segments
│   ├── VariationPicker.tsx # 3 glass cards with audio preview, selection, merge CTA
│   └── LoadingState.tsx    # Orbital ring + wave bars animation with substeps
└── lib/
    ├── api.ts              # All fetch calls, TypeScript interfaces
    └── supabase.ts         # Supabase browser client
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- ffmpeg + ffprobe in PATH
- [Gemini API key](https://aistudio.google.com/apikey) (free tier)
- [Google Cloud project](https://console.cloud.google.com/) with Vertex AI API enabled
- [Supabase project](https://supabase.com) (free tier)

### Setup

```bash
git clone https://github.com/your-username/vibesync-pro.git
cd vibesync-pro

# Environment — fill in your API keys
cp .env.example .env

# Database — run supabase_schema.sql in your Supabase SQL Editor

# Backend
cd backend
python -m venv venv          # einmalig
source venv/Scripts/activate  # jede neue Session (Git Bash)
pip install -r requirements.txt  # einmalig / nach neuen Dependencies
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

Or with Docker: `docker-compose up`

### Vertex AI / Lyria-002

Lyria-002 requires Google Cloud Application Default Credentials:

```bash
gcloud auth application-default login
gcloud services enable aiplatform.googleapis.com
```

The model is available in `us-central1` only. New GCP accounts include $300 free credits.

### Environment Variables

See [`.env.example`](.env.example) for all required variables:

- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/apikey)
- `GOOGLE_CLOUD_PROJECT` — your GCP project ID
- `GOOGLE_APPLICATION_CREDENTIALS` — path to service account JSON
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings
- `FRONTEND_URL`, `BACKEND_URL` — defaults to `localhost:3000` / `localhost:8000`

---

## License

MIT — see [LICENSE](LICENSE).
