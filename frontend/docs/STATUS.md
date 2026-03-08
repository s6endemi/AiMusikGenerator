# VibeSync Pro — Status & Next Steps

## Erledigt (7. März 2026)

### README & Open Source
- [x] Professionelle README.md (Architektur, Pipeline, Setup-Anleitung)
- [x] MIT License
- [x] Stripe/Payment komplett entfernt

### Authentication (Supabase)
- [x] Supabase Auth integriert (Frontend + Backend)
- [x] AuthModal: Google, GitHub, Discord OAuth + Email/Password + Forgot Password
- [x] OAuth via `@supabase/supabase-js` (Implicit Flow, client-side) — NICHT `@supabase/ssr`
- [x] Kein `/auth/callback` Route noetig — Supabase Client erkennt Session automatisch aus URL-Hash
- [x] `redirectTo` zeigt auf `window.location.origin` (Homepage)
- [x] Backend JWT-Verifikation via `supabase.auth.get_user(token)`
- [x] Auth-Gate: Upload + Analyse ohne Login, Auth erst bei "Generate"
- [x] Auto-Generate nach Login (pendingGenerateRef)
- [x] Session-Persistenz + Sign Out im Header

### Datenbank
- [x] `profiles` Tabelle (id, email, display_name, avatar_url)
- [x] `credits` Tabelle (5 Credits default)
- [x] `generations` Tabelle (History, noch nicht im UI)
- [x] Row Level Security auf allen Tabellen
- [x] DB-Trigger `handle_new_user()` ENTFERNT — war instabil
- [x] Profil + Credits werden stattdessen vom Backend erstellt (`initialize_user()`)

### Backend
- [x] `AuthUser` Klasse in `middleware/auth.py` — liefert id, email, full_name, avatar_url aus JWT
- [x] `initialize_user()` in `services/credits.py` — erstellt Profil + Credits beim ersten Login
- [x] `Depends(get_current_user)` auf geschuetzte Routes (music generate, credits)
- [x] Authorization via `Bearer <jwt>` Header
- [x] Stripe komplett entfernt (Config, Routes, Dependencies)

### OAuth Provider Setup
- [x] Google OAuth: Web Application Credentials + Redirect URI konfiguriert
- [x] GitHub OAuth: konfiguriert in Supabase
- [x] Discord OAuth: konfiguriert in Supabase
- [x] Alle Provider getestet und funktionsfaehig

---

## Was noch zu tun ist

### Prio 1 — Launch

| Task | Status |
|------|--------|
| Domain kaufen (z.B. vibesync.app) | ausstehend |
| Frontend deployen (Vercel) | ausstehend |
| Backend deployen (Google Cloud Run) | ausstehend |
| Supabase URL Config updaten (Site URL + Redirect URL auf Domain) | ausstehend |
| Google OAuth: Autorisierte JavaScript-Quellen + Consent Screen auf Production | ausstehend |
| GitHub/Discord OAuth: Callback URLs pruefen | ausstehend |
| Backend CORS fuer Production-Domain | ausstehend |
| Terms of Service + Privacy Policy Seiten | ausstehend |
| Full Flow testen: Login -> Generate -> Merge -> Download | ausstehend |

### Prio 2 — Verbesserungen

| Task | Beschreibung |
|------|-------------|
| Demo-Video | Screen Recording des Flows fuer Landing Page |
| Generation History | Gespeicherte Generierungen anzeigen (DB existiert) |
| Error Recovery | Retry-Buttons, Sentry Integration |
| Mobile UI | Responsive Audit, Touch-Targets |

---

## Architektur (aktuell, funktioniert)

```
User Flow:
  Upload Video (kein Login)
    -> Gemini 2.5 Flash analysiert
    -> User sieht Prompt + Segments (kein Login)
    -> Klick "Generate"
    -> Auth Modal (Google / GitHub / Discord / Email)
    -> Backend erstellt Profil + 5 Credits (initialize_user)
    -> Lyria-002 generiert 3 Variationen
    -> User waehlt Track
    -> ffmpeg merged mit LUFS + Sidechain
    -> Download MP4

Auth Flow (Implicit):
  AuthModal -> signInWithOAuth(redirectTo: origin)
    -> Provider (Google/GitHub/Discord)
    -> Redirect zurueck zu Homepage mit #access_token=...
    -> Supabase Client erkennt Hash automatisch
    -> onAuthStateChange fired -> Session gesetzt
    -> Backend-Call mit Bearer Token

Tech:
  Frontend:  Next.js 16 + React 19 + Tailwind 4
  Backend:   FastAPI + Python 3.12
  Auth:      Supabase (@supabase/supabase-js, implicit flow)
  DB:        Supabase Postgres (profiles, credits, generations)
  Video AI:  Gemini 2.5 Flash (structured output)
  Music AI:  Vertex AI Lyria-002 (us-central1)
  Audio:     ffmpeg (LUFS, sidechain, merge)
```

## Wichtige Learnings

- `@supabase/ssr` (PKCE Flow) ist fuer SSR-Apps gedacht. Fuer Client-Side SPAs ist `@supabase/supabase-js` direkt einfacher und zuverlaessiger.
- DB-Trigger fuer User-Erstellung sind fragil und schwer zu debuggen. Backend-seitige Erstellung ist robuster.
- Bei Problemen: immer pruefen ob alte Backend-Prozesse noch laufen (`taskkill` alte uvicorn/python Prozesse).
