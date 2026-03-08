 Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 VibeSync Pro — Demo Video + Auth + Payment Plan     

 Context

 VibeSync Pro hat eine funktionierende Pipeline (Upload → Gemini → Lyria → Merge → Download), aber kein Auth, kein        
 Payment, keine echten User. Ziel: App demo-ready machen (polished 30s video), Auth einbauen (Gate at Generate —
 Canva-Modell), Credit Packs (€2.99/10) aktivieren, und den Done-Screen für den "Wow-Effekt" upgraden.

 Strategie: Upload + Analyse sind kostenlos (kein Login). Auth-Modal erscheint erst beim Klick auf "Generate". User hat   
 den AI-Analyse-Wow-Moment bereits erlebt und ist invested.

 ---
 Part 1: Demo Video Polish (Done Screen + Loading Timings)

 1A. Done Screen Upgrade — der Money-Shot

 Datei: frontend/src/app/page.tsx (Zeilen 358–431)

 Aktuell: Simples "Your video is ready" + Video + 2 Buttons. Gut, aber nicht "wow".

 Änderungen:
 - Particle/Confetti-Burst Animation beim Eintritt (reine CSS, keine Library)
 - Größerer Video-Player mit subtilerem Glow
 - Stats-Zeile unter dem Video: Style-Label + BPM + Duration (aus selectedVariation + analysis)
 - Share-Buttons: "Copy Link" + "Share on X" (auch wenn Share-Links noch nicht gebaut sind — zeigt Virality-Denken im     
 Demo)
 - "Buy More Credits" CTA wenn credits < 2 (soft upsell, nicht aggressiv)
 - Credits-Remaining Badge am Done-Screen

 1B. Loading Timings für Demo-Aufnahme

 Datei: frontend/src/components/LoadingState.tsx — keine Änderung nötig, Timings werden in page.tsx per Props gesteuert.  

 Datei: frontend/src/app/page.tsx — Analyzing + Generating Steps

 Für Demo-Recording: kürzere stepDurations setzen damit der aufgenommene Flow snappy wirkt. Wir fügen einen DEMO_MODE     
 Flag hinzu (env var oder URL param ?demo=1), der:
 - Analyzing: stepDurations auf [800, 800, 800, 800] setzt (statt default 2200ms)
 - Generating: stepDurations auf [1000, 3000, 3000, 1000] setzt (statt 3000/18000/18000)
 - Merging: kürzer wartet visuell

 Kein Fake-Modus — die echten API-Calls laufen normal. Nur die visuelle Substep-Animation ist schneller. Das Backend      
 bestimmt die echte Wartezeit.

 ---
 Part 2: Supabase Auth (Gate at Generate)

 2A. Auth Modal Component

 Neue Datei: frontend/src/components/AuthModal.tsx

 - Glassmorphism Modal (passt zum Design-System aus globals.css)
 - Google OAuth Button (prominent, oben) — supabase.auth.signInWithOAuth({ provider: 'google' })
 - Email/Password Signup/Login (Tabs: "Sign up" / "Log in")
 - Messaging: "Sign up to generate — 3 free credits included"
 - Kein Facebook (braucht Meta Business Verification, dauert Wochen — Google + Email reicht)
 - Close-Button (X) — aber kein Dismiss wenn sie generieren wollen
 - Smooth fade-in Animation

 2B. Auth State Management

 Datei: frontend/src/app/page.tsx

 - useEffect Hook für Supabase Auth State Listener (supabase.auth.onAuthStateChange)
 - user State statt userIdRef mit randomUUID
 - Wenn User eingeloggt: user.id als Token für alle API-Calls
 - Wenn nicht eingeloggt: Upload + Analyse funktionieren ohne Auth (kein Token nötig)
 - Beim Klick auf "Generate 3 Variations" → Check user:
   - Wenn eingeloggt → normal generieren
   - Wenn nicht → setShowAuthModal(true) + nach Auth automatisch generieren
 - Credits-Display im Header nur wenn eingeloggt
 - Nach Login: initializeCredits(user.id) automatisch aufrufen

 2C. Auth Callback Route

 Neue Datei: frontend/src/app/auth/callback/route.ts

 - Next.js Route Handler für OAuth Callback
 - Supabase exchangeCodeForSession
 - Redirect zurück zur App

 2D. API Client Update

 Datei: frontend/src/lib/api.ts

 - analyzeVideo() braucht keinen userToken mehr (Backend erlaubt es ohne Auth)
 - generateVariations() sendet Supabase JWT Token statt random UUID
 - mergeVideoAudio() sendet JWT Token
 - Alle Credit-Calls senden JWT Token
 - Token kommt aus supabase.auth.getSession()

 2E. Supabase Client Update

 Datei: frontend/src/lib/supabase.ts

 - Bleibt createBrowserClient — Supabase SSR Package handled Sessions automatisch via Cookies
 - Keine Änderung nötig, aber Auth-Helper-Functions exportieren:
   - getUser() — current session user
   - getAccessToken() — JWT für Backend-Calls

 ---
 Part 3: Backend Auth

 3A. JWT Validation Middleware

 Neue Datei: backend/app/middleware/auth.py

 - Dependency Function get_current_user(request):
   - Liest Authorization: Bearer <jwt> Header
   - Verifiziert JWT gegen Supabase JWT Secret (oder via Supabase Admin API)
   - Returned user_id String
   - Wirft 401 wenn ungültig
 - Optional Dependency get_optional_user(request):
   - Returned user_id | None — für Endpoints die auch ohne Auth funktionieren (analyze)

 3B. Route Updates

 Datei: backend/app/api/video.py
 - /api/video/analyze — KEIN Auth required (optional user). Jeder kann analysieren.

 Datei: backend/app/api/music.py
 - /api/music/generate-variations — Auth REQUIRED. Deducts credit.
 - /api/music/merge — Auth REQUIRED.
 - Download-Endpoints — kein Auth (URLs sind temporary/random)

 Datei: backend/app/api/credits.py
 - Alle Endpoints: Auth REQUIRED
 - x-user-id Header → Authorization: Bearer Header
 - CREDITS_PER_PURCHASE = 10 (war 50)

 3C. Config Update

 Datei: backend/app/config.py
 - supabase_jwt_secret: str = "" — für lokale JWT Verification
 - Oder: JWT via Supabase Admin SDK verifizieren (einfacher, kein Secret nötig)

 ---
 Part 4: Credit System + Stripe

 4A. Pricing Update

 Datei: backend/app/api/credits.py
 - CREDITS_PER_PURCHASE = 10 (von 50)

 Stripe Dashboard:
 - Neues Product: "VibeSync Credits — 10 for €2.99"
 - Price ID in .env updaten

 4B. Buy Credits UX

 Datei: frontend/src/app/page.tsx

 - Header: Credits-Badge zeigt Balance + wenn < 2: pulsierender "Get Credits" Button
 - Done-Screen: wenn credits == 0 nach Generation, subtiler "Get 10 more for €2.99" CTA
 - Klick → createCheckout(token) → Stripe Redirect → Return → Credits refreshed

 ---
 Part 5: CSS Additions

 Datei: frontend/src/app/globals.css

 - Auth Modal Styles: backdrop blur, slide-up animation, glassmorphism card
 - Confetti/Particle keyframes für Done-Screen
 - Google Auth Button Style (matches design system, nicht Google's default)
 - "Get Credits" pulse animation

 ---
 Execution Order

 1. Done Screen Polish — sofort sichtbarer Impact fürs Demo-Video
 2. Demo Mode Flag — schnelle Loading-Animationen für Recording
 3. Auth Modal Component — UI zuerst, dann Logic
 4. Supabase Auth Integration — Frontend Auth State + Callback
 5. Backend JWT Middleware — Auth Dependency + Route Updates
 6. API Client Refactor — JWT statt x-user-id
 7. Credits + Stripe Update — €2.99/10, Buy Credits UX
 8. CSS Polish — alle neuen Animationen + Styles

 ---
 Dateien die geändert werden

 ┌─────────────────────────────────────────┬───────────────────────────────────────────────────────────────────┐
 │                  Datei                  │                             Änderung                              │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ frontend/src/app/page.tsx               │ Auth state, gate at generate, done screen, demo mode, buy credits │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ frontend/src/app/globals.css            │ Auth modal styles, confetti, pulse animations                     │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ frontend/src/components/AuthModal.tsx   │ NEU — Login/Signup Modal                                          │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ frontend/src/app/auth/callback/route.ts │ NEU — OAuth callback handler                                      │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ frontend/src/lib/api.ts                 │ JWT token statt x-user-id, analyze ohne auth                      │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ frontend/src/lib/supabase.ts            │ Auth helper exports                                               │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ backend/app/middleware/auth.py          │ NEU — JWT validation dependency                                   │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ backend/app/api/video.py                │ Optional auth (analyze bleibt offen)                              │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ backend/app/api/music.py                │ Required auth für generate + merge                                │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ backend/app/api/credits.py              │ Required auth, CREDITS_PER_PURCHASE = 10                          │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ backend/app/config.py                   │ JWT secret config                                                 │
 ├─────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
 │ backend/app/main.py                     │ Keine Änderung nötig (Routers bleiben gleich)                     │
 └─────────────────────────────────────────┴───────────────────────────────────────────────────────────────────┘

 ---
 Verification

 1. Demo Flow Test: App öffnen → Upload Video → Analyse läuft (keine Auth) → Edit Screen → Klick Generate → Auth Modal    
 erscheint → Google Login → Credits initialisiert (3) → Generation startet → Pick Variation → Merge → Done Screen mit     
 Wow-Effekt
 2. Demo Mode Test: ?demo=1 URL param → Loading-Animationen deutlich schneller
 3. Credit Depletion Test: 3 Generationen → Credits = 0 → "Buy Credits" CTA → Stripe Checkout
 4. Auth Persistence: Tab schließen → wieder öffnen → noch eingeloggt, Credits intact
 5. No-Auth Analyze: Nicht-eingeloggter User kann Video uploaden + Analyse sehen
 6. Backend Auth: API-Call ohne JWT zu /generate-variations → 401 Error