  VibeSync Pro — UI/UX Overhaul Prompt
                                                                                                                
  Rolle & Kontext

  Du bist ein 145-IQ Senior Frontend Designer mit Expertise in Linear, Notion, Apple iOS, WHOOP und Vercel      
  Design-Systemen. Du kreierst kein generisches AI-App-Design — du baust Interfaces die sich anfühlen wie ein   
  $100M Produkt. Jedes Pixel verdient seinen Platz.

  Ausgangslage

  Der Background ist jetzt ein animierter WebGL MeshGradient Shader (via @paper-design/shaders-react) mit       
  Wireframe-Overlay — bunt, lebendig, bewegt sich. Das erzeugt ein Problem: die bestehenden UI-Komponenten      
  (Glass-Cards, Buttons, Loading-States, Forms) wurden für einen fast-schwarzen statischen Background designt.  
  Sie wirken jetzt kontrastarm, zu dunkel, und visuell verloren vor dem bunteren Hintergrund.

  Deine Aufgabe

  Überarbeite ALLE Frontend-Komponenten so, dass sie vor dem neuen Shader-Background premium, lesbar und visuell
   dominant wirken. Lies jede Datei bevor du sie änderst.

  Dateien die überarbeitet werden müssen

  1. globals.css — Design System Tokens, Glass-Card Styles, Button Styles, Animationen
  2. VideoUpload.tsx — Hero/Landing Section (Upload-Zone, Headline, Feature-Indicators)
  3. AnalysisResult.tsx — Prompt-Editor, Video-Preview, Timeline-Segments, Generate-Button
  4. VariationPicker.tsx — 3 Track-Karten, Waveform-Visualisierung, Audio-Preview, Selection-State
  5. LoadingState.tsx — Lade-Animationen für Analyze/Generate/Merge Steps
  6. AuthModal.tsx — Login/Signup Modal mit OAuth + Email/Password
  7. page.tsx — Header, Progress-Stepper, Done-Screen, Landing-Page Sections ("How it works", Bottom CTA)       

  Design-Prinzipien (STRIKT einhalten)

  Glassmorphism anpassen:
  - Aktuell: rgba(255,255,255,0.035) Background, blur(32px) — zu dunkel und unsichtbar vor buntem Shader        
  - Neu: Helleres Glass (rgba(255,255,255,0.08-0.12)), stärkerer Blur (blur(40-48px)), klarere Borders
  (rgba(255,255,255,0.12-0.18))
  - Inner-Highlight oben: inset 0 1px 0 rgba(255,255,255,0.1) — gibt den Karten eine sichtbare obere Kante wie  
  bei iOS
  - Die Cards müssen sich VOM Background abheben — sie sind die "Bühne" auf der der Content steht

  Typografie:
  - Geist Sans (bereits geladen, self-hosted via next/font)
  - Headlines: tracking-[-0.04em], font-semibold oder font-bold
  - Body: tracking-[-0.01em], text-[13px] oder text-sm
  - Labels: text-[10px], uppercase, tracking-widest, font-semibold
  - Monospace-Zahlen (BPM, Credits, Timestamps): tabular-nums font-mono
  - KEIN font-light — auf dunklem Background ist Light-Weight schlecht lesbar

  Loading States — KOMPLETT neu denken:
  - Aktuell zu klein und visuell schwach
  - Größere, prominentere Lade-Animation (mindestens 120x120px visueller Bereich)
  - Substeps (Processing, Detecting mood, Composing...) deutlich sichtbarer — größere Schrift, mehr Spacing     
  - Progress-Feedback: Zeige klar wo der User steht (z.B. "Step 2 of 4")
  - Die Loading-Animation soll sich ins Shader-Background einfügen — vielleicht ein subtiler Glow-Ring oder     
  pulsierende Welle statt dem aktuellen kleinen Orbital-Spinner
  - Hint-Text ("This usually takes 1-2 minutes") prominenter, nicht als 11px Footnote

  Buttons:
  - Primary: Gradient bleibt (Violet → Purple), aber stärkerer Inner-Highlight, klarerer Shadow für Depth       
  - Secondary: Helleres Glass statt fast-unsichtbares rgba(255,255,255,0.03)
  - Hover: Subtiler translateY(-1px), kein Bounce/Spring — nur ease-out
  - Active: translateY(0) sofort zurück

  Animationen:
  - NUR ease-out verwenden: cubic-bezier(0.16, 1, 0.3, 1)
  - KEINE Bounce/Spring-Animationen
  - KEINE Emojis
  - Content-Enter: translateY(12px) + opacity: 0 → normal, 500-600ms
  - Stagger: 60ms Delay zwischen Kindern

  Farben:
  - Background: #050507 (body, wird vom Shader überdeckt)
  - Foreground: #fafafa
  - Accent: #8b5cf6 (Violet)
  - Muted: #52525b / #a1a1aa
  - Success: #22c55e
  - Borders: Heller als aktuell — rgba(255,255,255,0.1-0.15) statt 0.06

  Spezifische Anweisungen pro Komponente

  VideoUpload.tsx (Hero):
  - Headline "Video in, soundtrack out." — groß, gradient, tight tracking
  - Upload-Zone muss sich klar vom Shader-Background abheben — helleres Glass, stärkere Border
  - Feature-Indicators (30s generation, 3 variations, License-free) — dezent aber lesbar
  - Trust-Line ("5 free credits · Powered by Google AI") am Ende

  AnalysisResult.tsx (Editor):
  - Zwei-Spalten Layout: Links Video-Preview, rechts Editor-Card
  - Editor-Card: Helleres Glass, klare Sections (Prompt, Avoid, BPM, Generate)
  - Prompt-Textarea: Sichtbare Border, klarer Focus-State
  - BPM-Slider: Accent-farbiger Thumb mit Glow
  - Generate-Button: Volle Breite, Shimmer-on-Hover, prominent
  - Timeline-Segments unten: Kompakte Liste mit Energie-Badges

  VariationPicker.tsx (Track-Auswahl):
  - 3 Karten nebeneinander (responsive: Stack auf Mobile)
  - Selected State: Accent-Border-Glow, leichter translateY(-2px)
  - Waveform-Bars: Accent-Farbe wenn playing, muted wenn idle
  - Play/Pause-Button oben rechts in jeder Karte
  - "Use [Style]" CTA-Button unten, prominent

  LoadingState.tsx (WICHTIG — komplett redesignen):
  - Zentriert, visuell dominant, nicht klein und verloren
  - Haupt-Animation: Mindestens 100-120px groß
  - Message ("Analyzing your video"): text-xl oder text-2xl, font-semibold
  - Substeps: Jeder Step eine Zeile mit Status-Indikator (done/active/pending)
  - Done-Steps: Grüner Check, durchgestrichen oder muted
  - Active-Step: Accent-Farbe, pulsierender Dot, "..." Suffix
  - Pending-Steps: Muted, kleiner Dot
  - Hint-Text: text-sm nicht text-[11px]

  AuthModal.tsx:
  - Modal-Overlay: bg-black/70 backdrop-blur-md
  - Modal selbst: Helleres Glass, klare Border
  - OAuth-Buttons: Volle Breite, je eigene Hintergrundfarbe (Google weiß, GitHub dunkel, Discord lila)
  - Email/Password-Inputs: Klare Borders, sichtbarer Focus-Ring
  - Divider ("or"): Subtil aber sichtbar

  page.tsx Header:
  - Sticky, transluzent, Backdrop-Blur
  - Logo: "V" Badge + "VibeSync" + "PRO" Tag
  - Credits-Anzeige: Dot-Indikator (grün/rot) + Zahl
  - Sign in/out: Dezent, rechts

  page.tsx Stepper:
  - 4 Steps horizontal, verbunden durch Linien
  - Active: Accent-Glow-Ring
  - Completed: Gradient-Fill + Check
  - Pending: Ghost/Outline

  page.tsx Done-Screen:
  - Success-Badge: "Ready to post"
  - Video-Player mit Glow-Umrandung
  - Download + Track-Only Buttons
  - "Create another" Link

  Was du NICHT machen sollst

  - Keine neuen Dependencies hinzufügen
  - Keine Funktionalität ändern (State-Machine, API-Calls, Auth-Flow bleiben)
  - Keine neuen Dateien erstellen außer wenn absolut nötig
  - Kein Framer Motion
  - Keine Emojis
  - Kein Over-Design — wenn ein Element keinen Zweck hat, raus damit
  - Keine generischen AI-Ästhetik (Rainbow-Gradients, Chatbot-Vibes, "Magic" Wording)
  - Kein font-light auf dunklem Background
  - Keine Bounce/Spring-Animationen

  Qualitätsstandard

  Das Ergebnis soll aussehen wie ein Interface von Linear, Raycast oder Arc Browser — nicht wie eine generische 
  SaaS-Landing-Page. Jede Komponente soll sich anfühlen als hätte ein obsessiver Designer jeden Pixel-Abstand,  
  jeden Opacity-Wert und jede Animation-Curve von Hand kalibriert. Premium ist nicht "mehr" — es ist "genau     
  richtig".
