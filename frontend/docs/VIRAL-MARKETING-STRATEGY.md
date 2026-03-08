# VibeSync Pro — Viral Marketing Strategy

> **Ziel:** 0 → 1.000 aktive User in 8 Wochen
> **Kanäle:** Reddit + Communities (primär), Twitter/X Build-in-Public (sekundär)
> **Status:** Produkt ist live und deployed
> **Erstellt:** 08.03.2026

---

## 1. Strategischer Rahmen

### Das Prinzip: "Show the Magic Moment"

VibeSync hat einen unfairen Vorteil im Marketing: **Der Vorher/Nachher-Effekt ist sofort überzeugend.** Stilles Video → gleiches Video mit perfekt passendem AI-Soundtrack. Das braucht keine Erklärung. Das überzeugt in 3 Sekunden.

**Jeder Content-Piece muss diesen Moment zeigen.**

### Psychologische Hebel

| Hebel | Anwendung |
|-------|-----------|
| **Curiosity Gap** | "I uploaded a random TikTok and the AI composed THIS" — Ergebnis erst nach dem Klick |
| **Social Proof** | Jeder User-generierte Vorher/Nachher ist ein Testimonial |
| **Loss Aversion** | "2 free credits" — User verlieren was wenn sie es nicht probieren |
| **Effort Justification** | Zeige den alten Workflow (15 Min Stock Music suchen) vs. 60 Sekunden VibeSync |
| **Reciprocity** | Gib echten Value in Communities bevor du pitchst (Mixing-Tipps, Creator-Guides) |
| **Peak-End Rule** | Der "Wow-Moment" beim ersten Hören des generierten Tracks ist der Peak — optimiere darauf |

---

## 2. Reddit-Strategie (Primär-Kanal)

### Warum Reddit zuerst?

- Reddit-Posts ranken auf Google (Long-tail SEO Effekt)
- Die Zielgruppe (Creator, Filmmakers, Indie Devs) IST dort
- Authentische "I built this" Posts performen extrem gut
- Kein Ad-Budget nötig
- Ein viraler Post kann 10K-50K Views bringen

### Target Subreddits (nach Priorität)

#### Tier 1 — Launch-Posts (Woche 1-2)

| Subreddit | Members | Post-Typ | Timing |
|-----------|---------|----------|--------|
| **r/SideProject** | ~200K | "I built an AI that composes music for your videos" | Tag 1 |
| **r/InternetIsBeautiful** | ~17M | Clean link post mit Demo | Tag 3 |
| **r/webdev** | ~2M | Technical deep-dive: "How I built a video-to-music AI pipeline" | Tag 5 |
| **r/artificial** | ~800K | "Using Gemini + Lyria to build video-understanding music AI" | Tag 7 |

#### Tier 2 — Community Value Posts (Woche 2-4)

| Subreddit | Post-Typ |
|-----------|----------|
| **r/videoediting** | "Free tool: Upload your video, get a matching AI soundtrack" |
| **r/Filmmakers** | "I automated the music selection process for short films" |
| **r/TikTokCreators** | "Found this AI tool that makes custom music for your videos" (Alt-Account oder warten auf organische Posts) |
| **r/musicproduction** | Technical post über LUFS-basiertes Mixing und Sidechain Compression |
| **r/singularity** | "Video-to-Music AI: Gemini analyzes the vibe, Lyria composes the track" |

#### Tier 3 — Nischen-Communities (Ongoing)

| Subreddit | Angle |
|-----------|-------|
| **r/YouTubers** | Background music Problem lösen |
| **r/podcasting** | Intro/Outro Music generieren |
| **r/IndieDev** | Game trailer music |
| **r/Wedding** | Wedding video soundtracks |
| **r/RealEstate** | Property tour videos |

### Reddit Post-Templates

#### Template 1: "I Built This" (r/SideProject, r/webdev)

```
Title: I built an AI that watches your video and composes a matching soundtrack in 60 seconds

Body:
Hey [subreddit],

For the past few months I've been working on VibeSync Pro — an AI tool that
analyzes your video (mood, pacing, energy, scene cuts) and composes 3 original
music tracks that actually fit.

The problem: 50M+ creators post daily on TikTok/Reels/Shorts. Finding the right
music takes longer than editing the actual video. Stock music is generic.
Licensing is a nightmare.

How it works:
1. Upload any video (up to 30s)
2. AI analyzes mood, energy segments, and rhythm (Gemini 2.5 Flash)
3. Generates 3 music variations in different styles (Vertex AI Lyria)
4. Professional LUFS-based mixing + sidechain compression
5. Download your video with the perfect soundtrack

Tech stack: Next.js 16 + FastAPI + Gemini + Lyria + ffmpeg

You get 2 free credits — no account needed to try the analysis.

Would love feedback from this community. What would make this more useful for you?

[Link]
```

#### Template 2: "Behind the Tech" (r/artificial, r/MachineLearning)

```
Title: Video-to-Music AI: How I combined Gemini video understanding with
Lyria music generation

Body:
I built a pipeline that:
1. Takes a video upload
2. Gemini 2.5 Flash analyzes it (structured output: mood, BPM, energy
   segments, audio profile)
3. Converts the analysis into a music composition prompt
4. Lyria-002 generates 3 variations in parallel
5. LUFS-based adaptive mixing ensures broadcast-quality audio levels
6. Sidechain compression automatically ducks music during speech

The interesting engineering challenge was the analysis-to-prompt pipeline.
Gemini returns structured data about the video's emotional arc, and I had
to translate that into musical language that Lyria understands.

Example: A sunset timelapse with slow panning → Gemini detects "contemplative,
serene, gradual energy build" → Prompt becomes "Ambient cinematic score,
gentle piano arpeggios, warm pad textures, 72 BPM, building from minimal
to lush orchestration"

The sidechain compression was another fun problem — using ffmpeg's
sidechaincompress filter with attack 150ms, release 600ms, ratio 3.5 to
duck music when someone speaks in the video.

Happy to answer technical questions. Here's the tool if you want to try it: [Link]
```

#### Template 3: "Value-First" (r/videoediting, r/Filmmakers)

```
Title: Free tool for creators: Upload your video, get a custom AI soundtrack
(not stock music)

Body:
I know the pain of scrolling through Artlist/Epidemic Sound for 30 minutes
trying to find something that "kinda works."

Built a tool that actually analyzes your specific video — the mood, the pacing,
where the energy shifts — and composes original music that follows your video's
emotional arc.

It's not text-to-music. It's video-to-music. The AI watches your footage and
creates something that fits.

2 free generations, no account required for the analysis step.

[Link]

Would love to hear what you think. Especially interested in what genres/styles
you'd want to see.
```

### Reddit-Regeln (WICHTIG)

1. **Nie am gleichen Tag in mehreren Subreddits posten** — Reddit's Spam-Filter erkennt das
2. **Kommentare beantworten — IMMER** — Engagement in den ersten 2 Stunden entscheidet über den Post
3. **Kein Upvote-Manipulation** — Reddit bannt dafür permanent
4. **Account-Karma aufbauen** — Mindestens 1 Woche vorher in den Subreddits aktiv sein und hilfreiche Kommentare schreiben
5. **Titel sind alles** — A/B-teste mental: Würdest DU darauf klicken?
6. **Poste zwischen 8-10 Uhr EST** — Peak-Reddit-Traffic für US-Audience
7. **Crossposte NICHT** — Unique Posts für jedes Subreddit

---

## 3. Twitter/X Build-in-Public Strategie

### Account-Setup

- **Handle:** @vibesyncpro oder persönlicher Account mit Projekt-Bezug
- **Bio:** "Building VibeSync Pro — AI that watches your video and composes the perfect soundtrack. [Link]"
- **Pinned Tweet:** Best Demo-Video (Vorher/Nachher)
- **Banner:** Clean Product-Screenshot mit Glassmorphism-Ästhetik

### Content-Pillars (3-2-1 Regel pro Woche)

| Typ | Frequenz | Beispiele |
|-----|----------|-----------|
| **Build-in-Public Updates** | 3x/Woche | Metriken, Learnings, Behind-the-Scenes |
| **Demo/Showcase** | 2x/Woche | Vorher/Nachher Videos, User-Ergebnisse |
| **Value/Education** | 1x/Woche | "How LUFS works", "Why stock music fails creators" |

### Thread-Serie: "Building an AI Music Startup" (Woche 1-8)

#### Thread 1: Origin Story
```
🧵 I just launched an AI that watches your video and composes a matching soundtrack.

Here's how it works, the tech behind it, and what I learned building it:

(1/8)
```

#### Thread 2: The Tech Stack
```
🧵 The engineering behind video-to-music AI:

Gemini 2.5 Flash → Video Analysis
Lyria-002 → Music Composition
ffmpeg → Broadcast-Quality Mixing

Here's what each piece does and why I chose it:

(1/10)
```

#### Thread 3: First Users
```
🧵 Week 1 metrics of my AI music tool:

- X signups
- X generations
- X% conversion to paid
- Top feedback: "..."

Here's what surprised me:

(1/6)
```

#### Thread 4: The "Aha" Moment
```
🧵 The moment I knew this product had legs:

A user uploaded a sunset drone shot. The AI detected "contemplative,
gradual energy build" and composed ambient piano that swelled
exactly when the clouds parted.

No prompt. No manual editing. Just upload → music.

That's the magic.
```

### Daily Post-Formate

**Montag — Metrics Monday**
```
VibeSync Pro Week X:
📊 [User count] users
🎵 [Gen count] tracks generated
💡 Top learning: [insight]
🔜 This week: [what you're building/fixing]
```

**Mittwoch — Demo Day**
```
This video had no music.

VibeSync AI analyzed the mood, energy, and pacing —
then composed 3 original tracks.

Here's what it created:

[Video embed with before/after]
```

**Freitag — Behind the Scenes**
```
TIL while building VibeSync:

[Technical insight, design decision, or user feedback]

This changed how I think about [broader topic].
```

### Engagement-Taktik

1. **Reply to big Creator/AI accounts** mit relevanten Insights (nicht spammy)
2. **Quote-Tweet** relevante AI/Music/Creator Diskussionen mit deinem Angle
3. **Follow + Engage** mit: @levelsio, @marc_louvion, @dannypostmaa, @tabornak und anderen Indie Hackers
4. **Spaces beitreten** über AI Tools, Creator Economy, Indie Hacking
5. **Bookmark-Threads** von erfolgreichen Build-in-Public Accounts und reverse-engineere deren Format

### Hashtag-Strategie

Primär: `#buildinpublic` `#indiehackers` `#ai`
Sekundär: `#musicai` `#contentcreator` `#tiktok` `#reels`
Nie mehr als 3 Hashtags pro Tweet.

---

## 4. Community-Strategie (Sekundär-Kanäle)

### Indie Hackers (indiehackers.com)

- **Product Launch Post** mit Revenue-Zahlen und Tech-Stack
- **Milestone Updates** alle 2 Wochen
- Zielgruppe: Andere Founder die sharen, voten und Feedback geben
- Oft von Tech-Journalisten gescannt

### Hacker News (news.ycombinator.com)

- **"Show HN: VibeSync Pro — AI that watches your video and composes matching music"**
- Timing: Dienstag oder Mittwoch, 11 AM EST
- HN liebt technische Tiefe → post den Behind-the-Tech Angle
- **WARNUNG:** HN hasst Marketing-Sprech. Sei nüchtern, technisch, ehrlich
- Ein Front-Page HN Post = 5.000-20.000 Visits an einem Tag

### Product Hunt

- **Frühestens Woche 4** — erst Social Proof aufbauen
- Hunter finden der das Produkt featured
- Vorbereitung: 5+ Demo-Videos, Maker-Comment vorbereiten, Community vorab informieren
- Timing: Dienstag 00:01 PST

### Discord Communities

| Community | Strategie |
|-----------|-----------|
| **Indie Hackers Discord** | #share-what-you're-working-on |
| **Buildspace** | Alumni-Netzwerk |
| **Creator Economy** Discords | Value-first, dann Tool erwähnen |
| **AI Tool** Discords | Feature-Vergleiche und Demos |

---

## 5. Content-Assets (Was du brauchst)

### Must-Have Assets vor dem Push

| Asset | Zweck | Format |
|-------|-------|--------|
| **Hero Demo Video (30s)** | Jeder Social Post, Landing Page | MP4 — Vorher/Nachher side-by-side |
| **3 Nischen-Demos** | Verschiedene Use Cases zeigen | Travel Vlog, Product Shot, Drone Footage |
| **Product Screenshots** | Reddit Thumbnail, Twitter Cards | PNG — Glassmorphism UI in Action |
| **Tech Architecture Diagram** | HN, r/webdev, Twitter Threads | Clean Diagram mit Gemini → Lyria → ffmpeg Flow |
| **OG Image** | Link Previews überall | 1200x630 — "Upload a video, get a soundtrack" |
| **Twitter Banner** | Profil-Branding | 1500x500 — Product + Tagline |

### Nice-to-Have

| Asset | Zweck |
|-------|-------|
| **Comparison Video** | "15 Min Stock Music suchen vs. 60 Sek VibeSync" |
| **User Testimonial Clips** | Social Proof für spätere Posts |
| **Loom Walkthrough (2 Min)** | Für Product Hunt und längere Posts |

---

## 6. Funnel-Struktur

```
                    AWARENESS
                   ┌─────────┐
                   │ Reddit  │ ← "I built this" Posts
                   │ Twitter │ ← Build-in-Public
                   │ HN      │ ← Show HN
                   └────┬────┘
                        │
                   INTEREST
                   ┌────┴────┐
                   │ Landing │ ← Glassmorphism Hero
                   │  Page   │ ← Demo Showcase
                   │         │ ← "Try Free" CTA
                   └────┬────┘
                        │
                  ACTIVATION
                   ┌────┴────┐
                   │ Upload  │ ← Kein Account nötig
                   │ Video   │ ← Sofort-Analyse
                   │         │ ← "Wow" Moment bei Ergebnis
                   └────┬────┘
                        │
                  CONVERSION
                   ┌────┴────┐
                   │ Auth    │ ← OAuth (Google/GitHub/Discord)
                   │ Gate    │ ← Bei "Generate" klick
                   │         │ ← 2 Free Credits
                   └────┬────┘
                        │
                   REVENUE
                   ┌────┴────┐
                   │ Pricing │ ← Auto-opens bei 0 Credits
                   │ Modal   │ ← $0.99 / $2.99 / $9.99
                   └────┬────┘
                        │
                  RETENTION
                   ┌────┴────┐
                   │ Share   │ ← "Share your creation"
                   │ Return  │ ← Neues Video = neuer Besuch
                   │ Loop    │ ← Social Proof für andere User
                   └─────────┘
```

### Conversion-Optimierungen

1. **Kein Account für Analyse** → Senkt die Einstiegshürde drastisch
2. **OAuth statt Email-Signup** → 1-Klick statt Formular
3. **2 Free Credits** → User erleben den vollen Wow-Moment ohne zu zahlen
4. **Auto-Pricing-Modal** → Kein "Find Pricing" nötig, erscheint genau wenn die Motivation am höchsten ist
5. **Track-Only Download** → Auch ohne Merge können User den Track nutzen (Mehrwert)

---

## 7. Woche-für-Woche Execution Plan

### Woche 1: Foundation

- [ ] OG Image + Twitter Cards implementieren (meta tags)
- [ ] Demo-Videos aufnehmen (3 verschiedene Video-Typen)
- [ ] Reddit-Account Karma aufbauen (kommentieren in Ziel-Subreddits)
- [ ] Twitter/X Account Setup (Bio, Banner, Pinned Tweet)
- [ ] r/SideProject Post veröffentlichen
- [ ] Erster Twitter Thread: "I just launched..."

### Woche 2: Reddit Push

- [ ] r/InternetIsBeautiful Post
- [ ] r/webdev Technical Post
- [ ] r/artificial AI-Angle Post
- [ ] Alle Reddit-Kommentare beantworten (Engagement!)
- [ ] Twitter: 3 Posts (Metrics Monday, Demo Wednesday, BTS Friday)
- [ ] Indie Hackers Profil + erster Post

### Woche 3: Community Expansion

- [ ] r/videoediting + r/Filmmakers Posts
- [ ] Hacker News "Show HN" Post
- [ ] Twitter Thread: Tech Stack Deep-Dive
- [ ] Discord Communities joinen + erste Shares
- [ ] Erste User-Ergebnisse als Content recyclen

### Woche 4: Momentum

- [ ] r/musicproduction Technical Post
- [ ] Nischen-Subreddits (r/YouTubers, r/podcasting)
- [ ] Twitter Thread: "Week 3 Metrics + Learnings"
- [ ] Product Hunt Launch vorbereiten (Hunter finden, Assets)
- [ ] Erste User-Testimonials sammeln

### Woche 5-6: Product Hunt + Scale

- [ ] Product Hunt Launch (Dienstag)
- [ ] Alle Communities über PH-Launch informieren
- [ ] Twitter: Daily Updates während PH-Launch
- [ ] Reddit: AMA oder Follow-up Posts mit Ergebnissen
- [ ] Content-Recycling: Beste User-Creations als neue Posts

### Woche 7-8: Optimize + Iterate

- [ ] Analytics auswerten: Welcher Kanal bringt die meisten Signups?
- [ ] Verdopple den besten Kanal
- [ ] A/B-Test Landing Page Headlines
- [ ] Referral-Mechanik überlegen (Share → Free Credit?)
- [ ] Nächste Phase planen basierend auf Daten

---

## 8. Key Metriken (Track ab Tag 1)

| Metrik | Tool | Ziel Woche 8 |
|--------|------|---------------|
| **Unique Visitors** | Vercel Analytics / Plausible | 10.000+ |
| **Signups** | Supabase Dashboard | 1.000+ |
| **Generations** | Backend Logs | 2.000+ |
| **Conversion Free → Paid** | Stripe Dashboard | >5% |
| **Reddit Post Performance** | Reddit Analytics | 3+ Posts mit >500 Upvotes |
| **Twitter Followers** | Twitter Analytics | 500+ |
| **Retention (7-Day)** | Custom Event Tracking | >15% |

---

## 9. Copy-Formeln die konvertieren

### Headlines (Curiosity + Benefit)

- "Upload a video. Get a soundtrack. 60 seconds."
- "This AI watched my video and composed better music than I could find in 2 hours"
- "I replaced Artlist with an AI that actually understands my videos"
- "Your TikTok deserves better than stock music"
- "The missing layer in social media creation"

### CTAs

- "Try free — no account needed"
- "Upload your first video →"
- "2 free credits. No card required."
- "Hear what AI composes for YOUR video"

### Social Proof Lines (für nach den ersten Usern)

- "X videos soundtracked this week"
- "Creators in X countries use VibeSync"
- "X tracks generated and counting"

---

## 10. Viral Loops (Eingebaut ins Produkt)

### Kurzfristig (Jetzt implementierbar)

1. **Share Button nach Merge** → "Share your VibeSync creation" mit vorformuliertem Tweet/Post
2. **Watermark-Option** → Dezentes "Made with VibeSync" im Export (opt-out für Paid)
3. **"Powered by VibeSync"** in Audio-Metadata

### Mittelfristig (Woche 4-8)

4. **Referral Credits** → "Invite a friend, both get 1 free credit"
5. **Public Gallery** → Beste User-Creations auf der Landing Page
6. **Embed Widget** → User können ihr Vorher/Nachher auf eigenen Seiten embedden

### Langfristig

7. **Creator Profiles** → Öffentliche Profile mit allen Creations
8. **API für Developers** → Andere Tools integrieren VibeSync
9. **Template Marketplace** → User teilen erfolgreiche Prompt-Presets

---

## 11. Häufige Fehler (Vermeiden!)

| Fehler | Warum es schadet | Stattdessen |
|--------|-----------------|-------------|
| Zu viel auf einmal posten | Reddit/Twitter Spam-Filter, Audience-Fatigue | Max 1 Post pro Plattform pro Tag |
| Nur Features beschreiben | Keinen interessiert die Tech | Zeige das ERGEBNIS, den Wow-Moment |
| Keine Kommentare beantworten | Reddit-Algorithmus bestraft das | Erste 2 Stunden = Kommentar-Marathon |
| Fake Social Proof | Wird sofort durchschaut, besonders auf HN | Echte Zahlen, auch wenn klein |
| Zu früh Product Hunt | Verschwendeter Launch ohne Community | Erst Woche 4-6, mit bestehendem Momentum |
| Marketing-Sprech auf HN | Instant-Downvote | Technisch, nüchtern, ehrlich |
| Gleiches Template überall | Wirkt wie Spam | Unique Angle pro Community |

---

## 12. Budget-Übersicht (Bootstrapped)

| Posten | Kosten | Notwendig? |
|--------|--------|-----------|
| Custom Domain (vibesync.pro) | ~$15/Jahr | Ja — Credibility |
| Vercel Pro | $20/Monat | Optional — für Analytics |
| Demo-Video Recording | $0 (Screen Recorder) | Ja |
| Reddit Ads | $0 | Nein — organisch first |
| Twitter Blue | $8/Monat | Optional — für längere Posts + Edit |
| Product Hunt Ship | $0 | Ja |
| **Total Monat 1-2** | **~$15-43** | |

---

## TL;DR — Die 3 wichtigsten Dinge

1. **Zeige den Magic Moment** — Jeder Content-Piece = Vorher/Nachher Video
2. **Reddit first, dann Twitter** — Ein viraler Reddit-Post > 100 Tweets
3. **Value before Pitch** — Sei 2 Wochen hilfreich in Communities, DANN poste dein Tool

---

*Dieses Dokument ist ein lebendes Dokument. Update die Checklisten und Metriken wöchentlich.*
