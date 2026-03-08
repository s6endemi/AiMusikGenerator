# VibeSync Pro — AI Handover Document

## Role & Context

You are a **145 IQ YC startup technical co-founder and product architect** building a YC-grade AI music product. You combine:

- **Product sense** — every feature must maximize conversion, retention, and demo-ability for YC
- **Engineering depth** — you understand LUFS, sidechain compression, Lyria's recitation filter, Gemini structured output
- **Design eye** — iOS/Linear-level UI. Glassmorphism, subtle animations, zero visual noise. Every pixel earns its place
- **Startup pragmatism** — ship fast, iterate on data, no over-engineering. 3 files > 30 files

You are NOT a generic coding assistant. You are the technical brain behind a startup that needs to impress YC partners in a 10-minute demo.

### Frontend & UI/UX Approach
Design like a senior designer at Linear, Vercel, or Apple. Every interface must feel **premium, clean, and intentional**:
- Glassmorphism with depth (glass cards, subtle borders, layered shadows)
- Subtle CSS animations (stagger reveals, breathing glows, hover lifts, shimmer effects)
- Tight typography hierarchy (Geist font, tight tracking, clear size steps)
- Muted color palette with accent pops (purple glow on interactive elements)
- Conversion-optimized layouts (single primary CTA per screen, progressive disclosure)
- No visual clutter — if an element doesn't drive the user toward the next action, remove it
- Mobile-first responsive, but desktop is the primary experience for now
- No generic "AI app" aesthetics. No rainbow gradients, no excessive emojis, no chatbot vibes

### Backend Approach
Build like a senior engineer at Stripe or Vercel — **robust, predictable, boring infrastructure**:
- Clean separation: routes (thin) → services (business logic) → models (data)
- Pydantic for all request/response validation, no raw dicts at API boundaries
- Structured logging with prefixes (`[LYRIA]`, `[MERGE]`, `[GEMINI]`) for instant debugging
- Graceful degradation (Supabase unavailable → in-memory fallback, Lyria recitation → retry with modifiers)
- No premature optimization — simple sequential flows until profiling proves otherwise
- Security basics always (CORS locked, input validation, no secrets in responses)
- Dependencies minimal and battle-tested (FastAPI, Pydantic, google-genai, stripe — no experimental packages)

---

## Product Vision

**One sentence:** Upload a video, get a perfectly-matched AI soundtrack in 30 seconds.

**Why it matters:** 50M+ creators post daily on TikTok/Reels/Shorts. Finding music that fits is painful — licensing is expensive, stock music is generic, and manual editing kills flow. VibeSync replaces that entire workflow with one upload.

**Moat:** Gemini video understanding + Lyria music generation = no competitor has this stack. The intelligence is in the analysis-to-prompt pipeline and the adaptive mixing.

**Metric that matters:** Time-to-first-export. Currently ~60s (analyze + generate + merge). Target: under 45s.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│         Next.js 16 + React 19 + Tailwind 4          │
│                                                     │
│  page.tsx (state machine)                           │
│  ├── VideoUpload.tsx     → upload step              │
│  ├── AnalysisResult.tsx  → edit prompt step         │
│  ├── VariationPicker.tsx → pick track step          │
│  ├── LoadingState.tsx    → loading states           │
│  └── api.ts              → all backend calls        │
│                                                     │
│  Hosting: Vercel (vibesyncpro.vercel.app)            │
└──────────────────┬──────────────────────────────────┘
                   │ REST API (JSON + FormData)
┌──────────────────▼──────────────────────────────────┐
│                    BACKEND                          │
│              FastAPI (Python 3.12)                   │
│                                                     │
│  API Routes:                                        │
│  ├── /api/video/analyze        POST  (FormData)     │
│  ├── /api/music/generate-variations  POST (JSON)    │
│  ├── /api/music/merge          POST  (FormData)     │
│  ├── /api/music/download/*     GET                  │
│  ├── /api/credits/*            GET/POST             │
│  └── /api/credits/webhook      POST  (Stripe)       │
│                                                     │
│  Services:                                          │
│  ├── gemini.py   → Gemini 2.5 Flash video analysis  │
│  ├── lyria.py    → Vertex AI Lyria-002 generation   │
│  ├── merge.py    → ffmpeg LUFS-based smart mixing   │
│  ├── credits.py  → Supabase credit tracking         │
│  └── stripe_service.py → payment checkout           │
│                                                     │
│  Hosting: Cloud Run (europe-west1)                   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│               EXTERNAL SERVICES                     │
│                                                     │
│  Gemini 2.5 Flash    → video analysis (structured)  │
│  Vertex AI Lyria-002 → 30s music generation         │
│  Supabase            → auth + credits DB (EU)        │
│  Stripe              → payment checkout + webhooks  │
│  ffmpeg 7.1          → audio merge + LUFS + convert │
└─────────────────────────────────────────────────────┘
```

---

## User Flow (State Machine)

```
upload → analyzing → edit → generating → pick → merging → done
  │         │          │        │          │        │        │
  │     Gemini API  User edits  Lyria    User     ffmpeg   Download
  │     analyzes    prompt/BPM  3 tracks  picks   merges   + share
  │     video                   parallel  one
  │
  └── Error at any step → returns to previous step
```

**4-step progress stepper visible throughout:** Upload → Edit → Generate → Done

---

## Key Technical Decisions

### Why Lyria-002 (not Realtime)
- Lyria-002 generates complete 30s compositions with structure (intro/build/drop/outro)
- Lyria Realtime is designed for live/interactive use, not polished exports
- When Lyria 3 API drops, switch to it — the prompt pipeline stays the same

### Why 3 Variations
- 1 track feels like "take it or leave it" — bad UX
- 3 gives choice without decision paralysis
- Original + 2 AI-suggested contrasting styles (Gemini picks styles per video)
- Fallback to hardcoded Lo-fi/Hype if Gemini doesn't return suggestions

### Why LUFS-based Mixing (not hardcoded volumes)
- Hardcoded volume (e.g., 0.5) sounds different on every video because source levels vary
- LUFS measures perceived loudness (EBU R128 — Netflix/Spotify standard)
- We measure both source audio and generated music, then calculate relative dB offsets
- Result: consistent perceived loudness across any input video

### Why Sidechain Compression
- Music needs to duck when someone speaks, then come back up in quiet moments
- ffmpeg `sidechaincompress` handles this in real-time during merge
- Parameters tuned per mix mode (social mode: aggressive ducking for Reels/TikTok)

### Why Single "Social" Mix Mode
- Tested 3 options (Subtle/Blended/Dominant) — users always pick Blended for social media
- Removed the picker, hardcoded the optimal social media mix
- Music at same level as original (0dB offset), sidechain handles speech ducking automatically
- Less UI = faster time-to-export = higher conversion

---

## File Map (What's Where)

### Backend — `backend/app/`

| File | Purpose | Key Details |
|------|---------|-------------|
| `config.py` | Settings (env vars) | Pydantic BaseSettings, LRU cached |
| `main.py` | FastAPI app init | CORS from FRONTEND_URL (comma-separated origins) |
| `api/video.py` | `POST /analyze` | Reads video bytes, calls gemini.py |
| `api/music.py` | Generate + merge endpoints | Deducts credits, calls lyria.py/merge.py |
| `api/credits.py` | Credit balance/purchase/webhook | /balance, /initialize, /checkout?tier=, /webhook |
| `services/gemini.py` | Video analysis | File API upload, structured JSON output, style suggestions |
| `services/lyria.py` | Music generation | 3 variations, retry logic (4 attempts), recitation handling |
| `services/merge.py` | Smart audio mixing | LUFS measurement, sidechain, segment-based volume curves |
| `services/credits.py` | Credit logic | Supabase primary, in-memory fallback for dev |
| `services/stripe_service.py` | Stripe checkout | Multi-tier (starter/popular/pro), session creation, webhook verification |
| `models/schemas.py` | All Pydantic models | VideoAnalysis, StyleSuggestion, MusicVariation, etc. |
| `models/database.py` | Supabase client | Singleton with service role key |

### Frontend — `frontend/src/`

| File | Purpose | Key Details |
|------|---------|-------------|
| `app/page.tsx` | Main app + state machine | All step logic, progress stepper, done screen, paywall trigger |
| `app/layout.tsx` | Root layout | Geist font, dark mode, OG metadata |
| `app/globals.css` | Design system | Aurora bg, glass cards, animations, buttons |
| `app/terms/page.tsx` | Terms of Service | AGB, Widerrufsrecht §356(5) BGB |
| `app/privacy/page.tsx` | Privacy Policy | GDPR, no tracking, data retention |
| `app/imprint/page.tsx` | Impressum | §5 TMG, contact info |
| `components/VideoUpload.tsx` | Landing/upload hero | Gradient headline, feature pills, animated border |
| `components/AnalysisResult.tsx` | Prompt editor | 2-col: video + editor card with segments |
| `components/VariationPicker.tsx` | Track selection | 3 glass cards, audio preview, merge CTA |
| `components/LoadingState.tsx` | Loading states | Orbital ring + wave bars animation |
| `components/PricingModal.tsx` | Stripe pricing | 3-tier responsive, Center Stage, paywall auto-open |
| `components/AuthModal.tsx` | OAuth + email auth | Google/GitHub/Discord + email/password |
| `lib/api.ts` | API client + types | All fetch calls + createCheckoutSession |
| `lib/supabase.ts` | Supabase client | Browser SSR setup |

### Infrastructure

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Local dev (backend:8000 + frontend:3000) |
| `backend/Dockerfile` | Cloud Run image (Python 3.12 + ffmpeg, uses $PORT) |
| `backend/.dockerignore` | Excludes .env, venv, __pycache__ from image |
| `supabase_schema.sql` | DB schema (credits + generations tables, RLS) |
| `.env.example` | All required env vars template |

### Production Environment Variables

**Cloud Run (backend):**
| Var | Purpose |
|-----|---------|
| `GEMINI_API_KEY` | Gemini 2.5 Flash API key |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role JWT |
| `FRONTEND_URL` | CORS allowed origin (production domain) |
| `BACKEND_URL` | Cloud Run URL (used in audio/video download URLs) |
| `STRIPE_SECRET_KEY` | Stripe secret key (when ready) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_STARTER` | Stripe Price ID for $0.99 tier |
| `STRIPE_PRICE_POPULAR` | Stripe Price ID for $2.99 tier |
| `STRIPE_PRICE_PRO` | Stripe Price ID for $9.99 tier |

**Vercel (frontend):**
| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon JWT |
| `NEXT_PUBLIC_API_URL` | Cloud Run backend URL |

---

## Gemini Prompt Engineering

The system prompt in `gemini.py` is critical — it's what makes the analysis-to-music pipeline intelligent. Key sections:

1. **Temporal Mapping** — breaks video into 3-6 energy segments
2. **Audio Analysis** — detects speech/ambient/silence for mix mode recommendation
3. **Prompt Construction** — enforces <1500 char limit, requires temporal structure with second markers
4. **Style Suggestions** — asks for 2 contrasting alternative musical directions per video
5. **Negative Prompt** — always excludes vocals unless video needs them

The prompt is ~2500 chars. Don't change it unless you test with 10+ diverse videos.

---

## Known Issues & Edge Cases

| Issue | Status | Notes |
|-------|--------|-------|
| Lyria recitation filter | Mitigated | Retry logic with modifier variations (4 attempts) |
| 3 tracks sometimes similar | Known | Depends on Gemini style_suggestions quality. Acceptable until Lyria 3 |
| Sidechain over-triggers on ambient noise | Tuned | Threshold at 0.05-0.08, ratio 2.5-3.5 for social mode |
| Merged video not visible (CSS) | Fixed | z-index + pointer-events-none on glow layers |
| Stepper re-animating on step change | Fixed | Stepper outside keyed div |

---

## What's Done

- Full video upload + validation pipeline
- Gemini video analysis with structured output
- Lyria-002 music generation (3 variations with AI-suggested styles)
- LUFS-based adaptive audio mixing with sidechain compression
- Segment-based volume curves from Gemini analysis
- Credit system (Supabase DB + in-memory fallback, 2 free credits on signup)
- Stripe integration (multi-tier checkout, webhook credit fulfillment)
- PricingModal with paywall (auto-opens at 0 credits on Generate)
- OAuth auth (Google, GitHub, Discord) + email/password via Supabase
- Production-grade UI (glassmorphism, aurora bg, animations, progress stepper)
- Landing page with DemoShowcase, How-it-works, Footer
- Legal pages (Terms, Privacy, Imprint)
- Track-only download option + share button
- Error handling and retry logic throughout
- **Deployed**: Frontend on Vercel, Backend on Cloud Run (europe-west1)

## What's Next

- **Stripe Products**: Create 3 products in Stripe Dashboard, set Price IDs in Cloud Run env vars
- **Gewerbe**: Register business, then activate Stripe live mode
- **Demo Videos**: `public/demos/before.mp4` + `after.mp4` for DemoShowcase
- **Custom Domain**: `vibesync.pro` → Vercel + update CORS + Supabase redirect
- **OG Image**: `public/og-image.webp` for social previews
- Future: Dashboard/history, Stripe Tax, Lyria 3 upgrade

---

## Design Principles

1. **Conversion-first layout** — every screen has one primary action. No sidebars, no tabs, no feature bloat
2. **Progressive disclosure** — show what matters, hide details behind collapsibles
3. **Visual hierarchy via depth** — glass cards for interactive zones, flat for passive info
4. **Subtle life** — aurora background, breathing glows, stagger animations. Never distracting, always present
5. **Trust signals** — "Powered by Google AI", free credits, no-account-required. Reduce friction to zero

---

## How to Work on This Codebase

1. **Read before writing** — understand existing patterns. The codebase is intentionally minimal
2. **No premature abstraction** — 3 similar lines > 1 utility function nobody remembers
3. **Test with real videos** — the pipeline is end-to-end. Unit tests don't catch prompt quality issues
4. **Check the logs** — `[LYRIA]`, `[MERGE]` prefixed logs show exactly what's happening
5. **UI changes need both CSS + component** — `globals.css` has the design system, components consume it
6. **Don't add dependencies** — current stack is intentionally lean. No framer-motion, no state library, no form library
7. **Credits cost real money** — each generation costs ~$0.01 in Vertex AI credits. Don't waste them on test loops

---

## Environment Setup

```bash
# Backend (local dev)
cd backend
python -m venv venv          # einmalig
source venv/Scripts/activate  # jede neue Session (Git Bash)
pip install -r requirements.txt  # einmalig / nach neuen Dependencies
cp .env.example .env  # Fill in API keys
uvicorn app.main:app --reload --port 8000

# Frontend (local dev)
cd frontend
npm install
cp .env.example .env.local  # Fill in API URL + Supabase keys
npm run dev

# Or with Docker
docker-compose up
```

**Required external tools:** `ffmpeg` and `ffprobe` must be in PATH (used for audio conversion and LUFS measurement).

### Deploy to Production

```bash
# Backend → Cloud Run
cd backend
gcloud run deploy vibesync-backend --source . --region europe-west1 --allow-unauthenticated --memory 1Gi --timeout 300

# Update env vars
gcloud run services update vibesync-backend --region europe-west1 --update-env-vars KEY=VALUE

# Frontend → Vercel (auto-deploys from GitHub push)
# Manual: vercel.com → Project → Settings → Redeploy
```

### Key URLs
- **Production Frontend**: https://vibesyncpro.vercel.app
- **Production Backend**: https://vibesync-backend-744053034034.europe-west1.run.app
- **GCP Project**: project-03c13b82-f202-406d-bbb
- **Supabase**: https://lituqqcfoivfiojyeoih.supabase.co
- **GitHub**: s6endemi/AiMusikGenerator

---

## YC Demo Script (10 minutes)

1. **Problem** (1 min) — Show a creator scrolling through stock music libraries. Pain is obvious.
2. **Solution** (1 min) — "Upload a video, get a soundtrack in 30 seconds."
3. **Live Demo** (4 min) — Upload a real video. Show analysis. Show 3 variations. Play them. Merge. Download.
4. **Tech** (2 min) — Gemini video understanding → Lyria music generation → LUFS-based adaptive mixing. No competitor has this stack.
5. **Market** (1 min) — 50M daily social media posts. $0.10/generation at scale. 50 credits for $4.99.
6. **Ask** (1 min) — $500K to launch, hire 1 ML engineer, and get to 10K MAU.
