# VibeSync Pro — Strategic Roadmap

> This document defines what we build, in what order, and why.
> Every decision is filtered through one question: **"Does this get us closer to YC and 10K MAU?"**

---

## Current State (February 2026)

**What works:**
- Upload → Gemini analysis → Lyria generation (3 variations) → smart merge → download
- LUFS-based adaptive mixing with sidechain compression
- AI-suggested style variations per video
- Credit system (Supabase DB + in-memory fallback)
- Production-grade UI (glassmorphism, aurora bg, progress stepper, animations)

**What's missing for a real product:**
- No authentication (random UUID per session)
- No payment (Stripe configured but not wired)
- Not deployed (localhost only)
- No landing page (upload screen = landing)
- No history (close tab = lost forever)
- No growth loop (no sharing, no virality)

---

## Tier 1 — Launch Blockers

> Without these, we cannot go live, cannot show YC, cannot have real users.
> **Target: Complete all of Tier 1 before anything else.**

---

### 1.1 Authentication (Supabase Auth)

**Why:** Random UUIDs mean no returning users, no persistent credits, no identity. Every investor will ask "how many users do you have?" — we need real accounts to answer that.

**Scope:**
- [ ] Supabase Auth with Google OAuth (primary) + email/password (fallback)
- [ ] Login/signup modal or page (minimal, clean — not a separate auth flow)
- [ ] Session persistence — user stays logged in across tabs/sessions
- [ ] Replace `crypto.randomUUID()` in `page.tsx` with real Supabase user ID
- [ ] Backend validates Supabase JWT token instead of trusting `x-user-id` header
- [ ] Protected API endpoints — reject requests without valid session
- [ ] Redirect to login when accessing app without session

**Acceptance Criteria:**
- User signs in with Google, sees their credits, generates music, closes tab, comes back → still logged in, credits intact
- No way to access `/generate` endpoints without authentication

**Files affected:**
- `frontend/src/lib/supabase.ts` — already exists, needs auth methods
- `frontend/src/app/page.tsx` — replace UUID with session user
- `frontend/src/components/AuthModal.tsx` — new (login/signup UI)
- `backend/app/api/` — all routes need JWT validation middleware
- `backend/app/services/credits.py` — use real user IDs

**Estimated effort:** 1 day

---

### 1.2 Stripe Payment (Live Checkout)

**Why:** YC wants to see revenue traction. Even $50 in revenue proves willingness-to-pay. Credits without payment is a demo, not a business.

**Scope:**
- [ ] Configure Stripe keys in `.env` (secret key, webhook secret, price ID)
- [ ] Create Stripe product: "VibeSync Credits — 50 for €4.99"
- [ ] "Buy Credits" button in header when credits are low (< 1)
- [ ] Stripe Checkout redirect → payment → webhook → credits added
- [ ] Success/cancel redirect pages
- [ ] Receipt email via Stripe (automatic)
- [ ] Test with Stripe test mode, then switch to live

**Acceptance Criteria:**
- User with 0 credits clicks "Buy Credits" → Stripe Checkout → pays → returns to app → credits = 50
- Webhook is idempotent (same event twice doesn't double credits)

**Files affected:**
- `backend/app/api/credits.py` — webhook handler already scaffolded
- `backend/app/services/stripe_service.py` — checkout session creation exists
- `frontend/src/app/page.tsx` — add "Buy Credits" CTA
- `frontend/src/lib/api.ts` — `createCheckout()` already exists

**Estimated effort:** 0.5 day (most code exists, just needs wiring)

---

### 1.3 Deployment

**Why:** "Try it at localhost:3000" is not a pitch. We need a live URL that works on any device, anywhere.

**Scope:**
- [ ] Backend → Google Cloud Run (Dockerfile exists)
  - Set env vars in Cloud Run console
  - Enable public access (no auth on Cloud Run level, app handles it)
  - Region: `europe-west1` or `us-central1` (same as Lyria)
- [ ] Frontend → Vercel
  - Connect GitHub repo
  - Set `NEXT_PUBLIC_API_URL` to Cloud Run URL
  - Set Supabase env vars
- [ ] Custom domain: `vibesync.app` or `vibesyncpro.com`
  - DNS → Vercel (frontend)
  - Subdomain `api.vibesync.app` → Cloud Run (backend)
- [ ] CORS update — allow production domain
- [ ] HTTPS everywhere (Vercel + Cloud Run handle this automatically)
- [ ] Stripe webhook URL update → production endpoint

**Acceptance Criteria:**
- `vibesync.app` loads the app, user can sign up, upload video, generate music, pay for credits
- No CORS errors, no mixed content warnings

**Estimated effort:** 0.5 day

---

### 1.4 Landing Page

**Why:** First impression determines whether someone tries the product. The upload screen is functional but doesn't sell. A creator landing on the page needs to understand the value in 3 seconds.

**Scope:**
- [ ] Separate route `/` (landing) vs `/app` (the tool)
  - Landing: marketing, no auth required
  - App: the actual tool, auth required
- [ ] Landing page sections (single page, minimal scroll):
  1. **Hero** — headline + subline + CTA ("Try Free") + demo video/GIF
  2. **How it Works** — 3-step visual (Upload → AI Analyzes → Download)
  3. **Pricing** — Free (3 credits) vs Pro (50 credits / €4.99) — simple, no enterprise tier
  4. **Footer** — links, legal, social
- [ ] Demo video/GIF — screen recording of the actual flow (15-20s loop)
- [ ] Social proof (if available) — "Used by X creators" or testimonials
- [ ] Mobile responsive

**Design direction:**
- Same design system as app (aurora bg, glass cards, Geist font)
- Hero should feel like Linear's or Vercel's landing — bold headline, clear value prop, immediate CTA
- No feature bloat — one page, one scroll, one CTA

**Acceptance Criteria:**
- New visitor lands on `/` → understands what VibeSync does in 3 seconds → clicks "Try Free" → redirected to `/app` with signup
- Page loads in < 2s, scores 90+ on Lighthouse

**Estimated effort:** 1 day

---

## Tier 2 — Product-Market Fit Signals

> These features turn one-time users into returning users and create growth signals for YC.
> **Build these after Tier 1 is deployed and working.**

---

### 2.1 Generation History

**Why:** Without history, every generation is disposable. Users can't build a library, can't compare old results, can't come back to something they liked. The `generations` table already exists in Supabase — we just need to use it.

**Scope:**
- [ ] Save every successful generation to `generations` table:
  - `user_id`, `prompt`, `video_thumbnail` (extracted frame), `audio_url`, `merged_video_url`, `style_label`, `created_at`
- [ ] History page or panel in the app (`/app/history` or sidebar)
  - Grid of past generations with thumbnail + style label + date
  - Click to re-download or re-play
- [ ] Delete individual generations
- [ ] "Use this prompt again" → pre-fills editor with old prompt

**Why it matters for YC:** Shows engagement depth. "Users generate 3.2 tracks per session on average" is a fundable metric.

**Estimated effort:** 1 day

---

### 2.2 Share Links

**Why:** This is the **growth loop**. Every shared video is a free ad for VibeSync.

**Scope:**
- [ ] After merge, generate a public URL: `vibesync.app/v/{id}`
- [ ] Public page shows: video player + "Made with VibeSync" badge + "Create your own" CTA
- [ ] OpenGraph meta tags (thumbnail, title, description) — so the link looks good when shared on Twitter/Discord/WhatsApp
- [ ] Optional: light VibeSync watermark in corner of exported video (removable for Pro users)
- [ ] Copy-link button on done screen alongside download

**Growth math:** If 10% of users share, and each share reaches 100 people, and 2% click → 1000 generations = 200 shares = 20,000 impressions = 400 new signups.

**Estimated effort:** 1.5 days

---

### 2.3 Reliability & Error Recovery

**Why:** Every failed generation is a churned user. Creators have zero patience. If it doesn't work the first time, they leave.

**Scope:**
- [ ] "Retry" button on error states (not back-to-start)
- [ ] If only 2 of 3 variations succeed, show 2 instead of failing entirely (already handled, but UI should explain)
- [ ] Timeout handling — if generation takes > 90s, show option to retry or wait
- [ ] Frontend error boundaries — component-level error catching, not full-page crash
- [ ] Backend health check endpoint (`/health`) for monitoring
- [ ] Sentry integration for error tracking (frontend + backend)

**Target:** 95% success rate on the full upload→export flow.

**Estimated effort:** 1 day

---

## Tier 3 — Retention & Differentiation

> These make users stay and choose VibeSync over alternatives.
> **Build after first 100 real users, based on actual usage data.**

---

### 3.1 Prompt Presets / Quick-Start

**Why:** Not every creator wants to read and edit an AI-generated prompt. Many just want to pick a vibe and go.

**Scope:**
- [ ] After video analysis, show 3-4 preset buttons above the prompt editor:
  - "Chill & Ambient", "Upbeat & Energetic", "Cinematic & Epic", "Custom" (shows editor)
- [ ] Each preset overrides the prompt with a tuned template (but still uses Gemini's BPM/key/segments)
- [ ] "Custom" shows the full editor (current behavior)
- [ ] Track which presets users pick → data for improving defaults

**Impact:** Reduces time-to-generate by ~15s (skip prompt editing). Increases conversion for users intimidated by the prompt editor.

**Estimated effort:** 0.5 day

---

### 3.2 Speed Optimization

**Why:** 60s is acceptable. 30s would be remarkable. Speed is a feature.

**Scope:**
- [ ] Parallelize where possible:
  - Start Lyria generation while Gemini is still processing? (if prompt is ready)
  - Generate 3 variations in parallel (currently sequential)
- [ ] Show real progress (not just spinner):
  - "Analyzing video... (step 1/3)"
  - "Generating Original... Generating Jazz Lounge... Generating Synthwave..."
  - "Merging audio..."
- [ ] Consider Lyria Realtime for a "Quick Preview" mode (lower quality, instant)
- [ ] Cache Gemini analysis — if same video uploaded twice, skip re-analysis

**Target:** Under 45s for full flow.

**Estimated effort:** 1-2 days (parallelization requires careful async handling)

---

### 3.3 Mobile Experience

**Why:** Creators film on phones. The ideal flow: film → upload from camera roll → get soundtrack → post directly.

**Scope:**
- [ ] Responsive UI audit — every component must work on 375px width
- [ ] Touch-friendly controls (larger tap targets, swipe on variation cards)
- [ ] Camera roll integration (file picker works, but UX needs tuning)
- [ ] PWA support (installable on home screen, offline-capable for history browsing)

**Estimated effort:** 1 day

---

### 3.4 Lyria 3 Migration

**Why:** When Google releases Lyria 3 API, track quality will jump significantly. Our prompt pipeline stays the same — only the endpoint changes.

**Scope:**
- [ ] Monitor Google AI announcements for Lyria 3 API availability
- [ ] When available: swap endpoint in `lyria.py`, test with existing prompts
- [ ] Adjust prompt engineering if Lyria 3 has different input format
- [ ] A/B test quality: Lyria 2 vs Lyria 3 on same prompts

**Estimated effort:** 0.5 day (when API is available)

---

## Priority Matrix

```
                    HIGH IMPACT
                        │
           Tier 1.4     │     Tier 2.2
          Landing Page   │    Share Links
                        │
    LOW EFFORT ─────────┼───────── HIGH EFFORT
                        │
           Tier 1.2     │     Tier 2.1
          Stripe Live   │    Gen History
           Tier 1.1     │     Tier 2.3
          Auth          │    Reliability
           Tier 1.3     │
          Deploy        │
                        │
                    LOW IMPACT
```

**Execution order (serial, one at a time):**
1. Auth (1.1) — everything depends on real users
2. Stripe (1.2) — can't test payment without auth
3. Deploy (1.3) — can't get users without a URL
4. Landing Page (1.4) — can't convert visitors without a landing
5. Share Links (2.2) — growth loop starts immediately
6. History (2.1) — retention starts here
7. Reliability (2.3) — data from real users tells us what breaks

---

## YC Application Checklist

- [ ] Live product at custom domain
- [ ] 50+ real users (friends, creator communities, Reddit, ProductHunt)
- [ ] Any revenue ($1 is better than $0)
- [ ] Demo video (30s screen recording of the full flow)
- [ ] Metrics: generations per user, time-to-export, conversion rate (free → paid)
- [ ] Clear answer to "Why now?" → Gemini + Lyria stack just became available, no competitor has this
- [ ] Clear answer to "Why you?" → technical depth (LUFS mixing, sidechain, prompt engineering), speed of iteration
- [ ] 1-minute pitch rehearsed and tight

---

## Success Metrics (Post-Launch)

| Metric | Target (Month 1) | Why It Matters |
|--------|-------------------|----------------|
| Signups | 500 | Product interest |
| Generations | 1,500 | Core usage |
| Paid conversions | 20 (4%) | Revenue signal |
| Revenue | €100 | Proves willingness-to-pay |
| Shares | 50 | Growth loop working |
| Return rate (7-day) | 15% | Retention signal |
| Success rate | 95% | Reliability |
| Time-to-export | < 50s | UX quality |
