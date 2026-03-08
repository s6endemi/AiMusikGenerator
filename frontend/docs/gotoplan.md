● Der Plan — Priorisiert, kein Fluff                                                                                                                                                                                                                
  Schritt 1: Demo-Video aufnehmen (heute)                                                                                 
  
  Tool: https://www.screen.studio/ (Mac) oder https://obsproject.com/ (Windows, kostenlos). ScreenStudio macht automatisch   smooth Zoom-Ins auf Cursor-Klicks — sieht sofort polished aus. OBS ist kostenlos, dann schneidest du in CapCut         
  (kostenlos) oder DaVinci Resolve.

  Vorgehen:

  1. Vorbereitung — Generiere vorher 5-10 Tracks mit verschiedenen Videos. Pick die 2-3 wo Lyria-002 am besten klingt.    
  Merk dir welches Video + welcher Style.
  2. Aufnahme — Ein ununterbrochener Take des echten Flows:
    - Drop Video → AI analysiert (Substeps ticken ab) → Edit Screen erscheint → Klick Generate → Loading (Substeps) →     
  Variations erscheinen → Preview klicken (Waveform animiert) → "Use" klicken → Done Screen → Video spielt mit Soundtrack 
  3. Post-Edit in CapCut/DaVinci (30 Min Arbeit):
    - Speed-Ramp: Analyse-Wait 4x beschleunigen (statt 15s → 3s). Composing-Wait 8-10x beschleunigen (statt 90s → 10s).   
  Merge sofort.
    - Audio: Den generierten Track als Audio-Spur unter das ganze Video legen. Startet leise beim Upload, wird lauter bei 
  den Variations, volle Lautstärke beim Done Screen. Der Zuschauer HÖRT das Ergebnis die ganze Zeit.
    - Keine Text-Einblendungen. Das Produkt spricht für sich.
    - Loop: Letzter Frame cross-faded zum ersten Frame → endlose Loop für Landing Page.
    - Länge: 15-20 Sekunden. Nicht länger.

  Schritt 2: Landing Page (morgen)

  Keine separate Seite bauen. Dein Produkt IST die Landing Page.

  Der smarteste Move: Bau eine / Route die beides ist — Landing + App. So:

  Besucher kommt auf vibesync.app
          ↓
  Sieht: Hero + Demo-Video + "Try Free" Button + Email-Signup
          ↓
  Klickt "Try Free"
          ↓
  Scrollt/faded zum Upload-Screen (dem echten Produkt)
          ↓
  Kann sofort loslegen mit 3 Free Credits

  Kein separates /app. Kein Login-Gate. Kein Account. Der User droppt ein Video, bekommt Musik, ist begeistert — und DANN 
  fragen wir nach der Email ("Save your creation — enter email").

  Value first, gate later. Das ist wie Figma, Notion, Canva — du nutzt das Produkt bevor du dich anmeldest.

  Schritt 3: Deploy (gleicher Tag wie Landing Page)

  - Frontend → Vercel (GitHub repo connecten, 5 Minuten)
  - Backend → Google Cloud Run (Dockerfile existiert schon)
  - Domain: vibesync.pro oder vibesync.app (was verfügbar ist)

  Schritt 4: Viral Distribution (sofort nach Deploy)

  Hier trennt sich Startup von Hobby-Projekt. Du brauchst keinen Product Hunt Launch. Du brauchst 5 Posts an den richtigen
   Orten.

  Kanal 1: Twitter/X (höchstes Viral-Potenzial)

  Post-Format das funktioniert:
  I built an AI that watches your video and composes
  a matching soundtrack in 30 seconds.

  No prompts. No music library. Just drop a video.

  [Demo-Video eingebettet, 15s Loop]

  Try it free: vibesync.app
  - Poste zwischen 14-16 Uhr CET (US East Coast wacht auf)
  - Tag: #buildinpublic #AI #indiehackers
  - Reply auf deinen eigenen Post mit dem Tech-Stack ("Built with Gemini + Lyria, here's how the pipeline works...") —    
  Tech-Twitter liebt Behind-the-Scenes

  Kanal 2: Reddit (r/SideProject, r/InternetIsBeautiful)

  - r/SideProject: "I built VibeSync — upload a video, get an AI soundtrack in 30s. Free to try."
  - r/InternetIsBeautiful: Nur wenn das Produkt WIRKLICH smooth ist. Dieses Sub bringt 50K+ Views.
  - r/VideoEditing, r/NewTubers: "Free tool for creators — AI-generated music that matches your video"

  Kanal 3: Creator-DMs (10 pro Tag)

  Such dir Creator mit 10K-100K Followern (nicht die Millionen-Accounts). DM:
  Hey [Name], built a free tool that creates custom soundtracks
  for videos using AI. Would love your honest feedback —
  it takes 30 seconds to try: vibesync.app

  Kein Pitch. Kein "Please share." Nur: "Would love your feedback." 30% werden es probieren. 5% werden es posten.

  Schritt 5: Email-Capture im Produkt

  Nach dem Done-Screen, NACH dem Download — zeig ein subtiles:
  ┌──────────────────────────────────────────┐
  │                                          │
  │   Want to save your creations?           │
  │                                          │
  │   [  your@email.com  ] [ Save ]          │
  │                                          │
  │   We'll let you know when new features   │
  │   drop. No spam, ever.                   │
  │                                          │
  └──────────────────────────────────────────┘

  Das ist deine Waitlist. Aber besser — der User hat GERADE den Wert erlebt. Die Conversion-Rate auf diese Email-Capture  
  wird 30-40% sein, statt 5% auf einer kalten Waitlist-Page.

  ---
  Timeline

  ┌────────────┬──────────────────────────────────────────────┬───────────────────────┐
  │    Tag     │                     Was                      │        Output         │
  ├────────────┼──────────────────────────────────────────────┼───────────────────────┤
  │ Heute      │ Demo-Video aufnehmen + schneiden             │ 15s Loop-Video        │
  ├────────────┼──────────────────────────────────────────────┼───────────────────────┤
  │ Morgen     │ Landing Page bauen + Deploy                  │ Live URL              │
  ├────────────┼──────────────────────────────────────────────┼───────────────────────┤
  │ Übermorgen │ 3 Posts (Twitter, Reddit x2)                 │ First traffic         │
  ├────────────┼──────────────────────────────────────────────┼───────────────────────┤
  │ Tag 4-7    │ 10 Creator-DMs pro Tag                       │ Feedback + erste User │
  ├────────────┼──────────────────────────────────────────────┼───────────────────────┤
  │ Tag 7      │ Auswertung: Signups, Generierungen, Feedback │ Go/Pivot Entscheidung │
  └────────────┴──────────────────────────────────────────────┴───────────────────────┘

  ---
  Was soll ich als nächstes bauen?

  Die Landing Page Section die vor dem Upload-Screen sitzt — Hero, Demo-Video Embed, und der "Try Free" Button der zum    
  Upload scrollt. Das ist 2-3 Stunden Arbeit und gibt dir eine deploybare URL.

  Soll ich damit anfangen?