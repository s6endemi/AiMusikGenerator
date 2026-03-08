# VibeSync Pro – Social Media Music Agent

## Tech Stack

| Komponente | Technologie |
|---|---|
| Frontend | Next.js 15+ (App Router) + Tailwind |
| Backend | FastAPI (Python 3.12+) |
| Video-Analyse | Gemini 3.1 Pro (`gemini-3.1-pro-preview`) via Gemini API |
| Musik-Engine | Vertex AI `lyria-002` (us-central1) |
| Hosting | Cloud Run (Backend) + Vercel (Frontend) |
| Payment | Stripe Credit System |
| DB | Supabase oder SQLite |

---

## Agentic Workflow

```
1. VIDEO UPLOAD (max 30s)
   → Frontend → FastAPI → Gemini File API

2. GEMINI 3.1 PRO ANALYSE (Structured Output)
   response_mime_type: "application/json"
   → JSON: { bpm, mood, primary_prompt, negative_prompt, reasoning }

3. HUMAN-IN-THE-LOOP
   → Editierbares Textfeld prefilled mit primary_prompt
   → User sieht "reasoning" und kann Prompt anpassen

4. LYRIA-002 GENERIERUNG
   → sample_count: 1
   → Response: Base64 WAV → MP3 (ffmpeg)

5. OUTPUT
   → Audio Player + WAV Download (Pro) + MP3 Download (Free)
   → SynthID Wasserzeichen automatisch enthalten
```

---

## Gemini 3.1 Pro – Structured Output Config

```python
# Video Upload (< 20MB: inline_data, > 20MB: File API)
client = genai.Client()  # google-genai SDK >= 1.52.0
video_file = client.files.upload(path="video.mp4")  # File API

config = {
    "response_mime_type": "application/json",
    "response_schema": {
        "type": "object",
        "properties": {
            "bpm":             {"type": "integer"},
            "mood":            {"type": "string"},
            "primary_prompt":  {"type": "string"},
            "negative_prompt": {"type": "string"},
            "reasoning":       {"type": "string"}
        },
        "required": ["bpm", "primary_prompt", "mood"]
    }
}
# ~300 Tokens pro Sekunde Video (1 FPS Standard)
```

## Gemini System Prompt

```
Analysiere dieses Video hinsichtlich Bewegung, Farben und Schnittrhythmus. 
Erstelle ein JSON-Objekt für einen Lyria-Musik-Prompt. 
Der 'primary_prompt' muss Instrumentierung und Stimmung auf Englisch beschreiben, 
ohne Künstlernamen zu nennen.
```

## Lyria-002 – Exakter API Payload

```json
POST https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}
     /locations/us-central1/publishers/google/models/lyria-002:predict

{
  "instances": [{
    "prompt": "user-edited prompt string",
    "negative_prompt": "vocals, heavy drums"
  }],
  "parameters": {
    "sample_count": 1
  }
}
```

- **Output:** Base64-String im Feld `audioContent` → dekodieren → `.wav`
- **Spec:** 48kHz, 16-bit PCM, max ~32.8 Sekunden
- **ffmpeg:** `ffmpeg -i input.wav -codec:a libmp3lame -b:a 320k output.mp3`

- **Free Tier:** 3 Gratis-Credits/Tag (Session-basiert)
- **Paid:** "VibeSync Bundle" – 50 Credits für 4,99€
- **Stripe Webhook:** `checkout.session.completed` → Credits in DB schreiben
- **Guard:** `/generate` Endpunkt gesperrt bei 0 Credits

---

## Kosten

- €300 Vertex Guthaben ≈ ~25.000 vollständige Video-zu-Musik Zyklen

---

## Claude Code Prompt (direkt verwenden)

```
Erstelle eine Full-Stack-Anwendung namens "VibeSync Pro" mit Next.js 15 
(App Router) als Frontend und FastAPI (Python 3.12) als Backend.

VIDEO-LOGIK:
- Video Upload (max 30s, drag & drop) im Frontend
- Backend lädt Video via Gemini File API hoch (google-genai SDK v1.52.0+)
- Warte auf File Processing State bevor Analyse startet
- Gemini 3.1 Pro (gemini-3.1-pro-preview) analysiert Video mit 
  response_mime_type: "application/json"
- System Prompt: "Analysiere dieses Video hinsichtlich Bewegung, Farben 
  und Schnittrhythmus. Erstelle ein JSON für einen Lyria-Musik-Prompt. 
  primary_prompt auf Englisch, keine Künstlernamen."
- JSON Schema: { bpm: int, mood: str, primary_prompt: str, 
  negative_prompt: str, reasoning: str }

MUSIK-LOGIK:
- Sende (editierten) Prompt an Vertex AI lyria-002 (us-central1)
- Application Default Credentials (gcloud auth application-default login)
- sample_count: 1
- Base64-Response dekodieren → WAV speichern
- ffmpeg Konvertierung WAV → MP3

UI (Tailwind):
- Drag-and-Drop Video Upload Feld
- Pulsierende Lade-Animation während Analyse ("Analyzing your video...")
- Zweispaltiges Layout nach Analyse:
  Links: Video-Vorschau
  Rechts: Editierbares Textfeld mit primary_prompt + BPM-Slider + reasoning Anzeige
- "Generate Music" Button
- Audio Player Card mit Waveform-Visualisierung
- Download Buttons: WAV (Pro) + MP3 (Free)

CREDITS & PAYMENT:
- Stripe Integration: Checkout Session für "50 Credits – 4,99€"
- Webhook: checkout.session.completed → Credits in SQLite/Supabase schreiben
- /generate Endpunkt: prüft Credits, zieht 1 Credit ab bei Erfolg
- Free Tier: 3 Gratis-Credits/Tag (Session-basiert, kein Login nötig für v1)

DEPLOYMENT:
- Dockerfile für FastAPI Backend (Cloud Run ready)
- .env.example mit allen benötigten Keys:
  GEMINI_API_KEY, GOOGLE_CLOUD_PROJECT, STRIPE_SECRET_KEY, 
  STRIPE_WEBHOOK_SECRET
```

---

## Phase 2 (nach Launch)
- Lyria RealTime (`lyria-realtime-exp`) für Echtzeit Video-Sync
- ffmpeg Video+Audio Merge → User downloadt fertiges Video mit Soundtrack
- Google Antigravity für komplexere Agentic Workflows