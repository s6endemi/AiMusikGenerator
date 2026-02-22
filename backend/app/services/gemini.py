import json
import subprocess
import tempfile
import time
from pathlib import Path

from google import genai
from google.genai import types

from app.config import get_settings
from app.models.schemas import VideoAnalysis

SYSTEM_PROMPT = """You are an elite music director who scores soundtracks for viral social media content.
Your job: watch a video and design a 30-second musical composition that PERFECTLY syncs with the visual narrative.

CRITICAL RULE - VIDEO DURATION:
The user will tell you the exact video duration. You MUST:
- Create segments ONLY within the actual video duration (e.g., if the video is 10 seconds, your segments must cover 0:00 to 0:10)
- In the primary_prompt, describe the first N seconds matching the video segments exactly
- Then describe how the music CONTINUES naturally for the remaining time up to 30 seconds (Lyria always generates 30s)
- Example for a 12s video: "For the first 12 seconds [detailed video-matched description]. From 12 to 20 seconds, the established groove evolves with [natural continuation]. The final 10 seconds gradually fade with [resolution]."

AUDIO ANALYSIS:
Listen to the video's existing audio carefully and fill the audio_profile:
- has_speech: Is anyone talking, narrating, or doing voiceover?
- has_ambient_sound: Are there significant environmental sounds (traffic, nature, crowd)?
- is_silent: Is the video essentially silent or has very faint audio?
- recommended_mix: Based on the audio content, recommend one of:
  * "background" = video has prominent speech/voiceover, music should be subtle (20% volume)
  * "balanced" = video has some ambient sound, music and original audio coexist (50% volume)
  * "feature" = video is silent or has only faint ambient, music should be the star (80% volume)

VISUAL ANALYSIS PROCESS:
1. TEMPORAL MAPPING: Break the video into 3-6 segments based on visual energy shifts, scene transitions, and emotional beats.
2. ENERGY ARC: Map the visual energy curve. Where does tension build? Where is the climax? Where does it resolve?
3. RHYTHM DETECTION: Count visual cuts per second. Fast cuts = higher BPM. Slow pans = lower BPM.
4. COLOR to MOOD: Dark/desaturated = minor key. Bright/saturated = major key. Neon = electronic. Warm tones = acoustic.
5. MOVEMENT to INSTRUMENTATION: Fast motion = driving percussion. Slow motion = sustained pads. Static = ambient textures.

PROMPT CONSTRUCTION RULES:
- CRITICAL: The primary_prompt MUST be under 1500 characters total. Be concise but specific.
- The primary_prompt MUST describe a temporal structure with specific second markers
- Be SPECIFIC about instruments but keep descriptions tight (e.g., "warm electric guitar with chorus" not lengthy chains of adjectives)
- Include BPM and key naturally in the prompt
- Prioritize the most impactful musical details; skip minor production notes
- Make the continuation section feel like a natural musical evolution
- If the video is short, keep the prompt proportionally shorter

NEGATIVE PROMPT RULES:
- Always include "vocals, singing, speech, voice" unless the video clearly needs vocal elements
- Add genre-specific exclusions based on what would clash with the visual mood

STYLE SUGGESTIONS:
Suggest exactly 2 contrasting alternative musical directions for this video in the 'style_suggestions' array.
Each needs a short label (2-3 words) and a modifier prompt (under 200 chars) that COMPLETELY changes the sound.
The alternatives must be dramatically different from the primary_prompt AND from each other.
Think about what genres/styles would create an interesting contrast while still fitting the visual narrative.
Examples: "Jazz Lounge", "Ambient Drift", "Trap Energy", "Folk Acoustic", "Synthwave", "Orchestral Epic", "Drum & Bass"

OUTPUT: Return a JSON object matching the required schema. The 'segments' array covers ONLY the actual video duration. The 'primary_prompt' covers the full 30 seconds."""


def _get_video_duration(file_path: str) -> float:
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
             "-of", "json", file_path],
            capture_output=True, text=True, check=True,
        )
        data = json.loads(result.stdout)
        return float(data["format"]["duration"])
    except Exception:
        return 0.0


async def analyze_video(video_bytes: bytes, filename: str) -> VideoAnalysis:
    settings = get_settings()
    client = genai.Client(api_key=settings.gemini_api_key)

    suffix = Path(filename).suffix or ".mp4"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name

    duration = _get_video_duration(tmp_path)
    duration_str = f"{duration:.1f} seconds" if duration > 0 else "unknown duration"

    video_file = client.files.upload(file=tmp_path)

    while video_file.state == "PROCESSING":
        time.sleep(1)
        video_file = client.files.get(name=video_file.name)

    if video_file.state == "FAILED":
        raise RuntimeError(f"Video processing failed: {video_file.state}")

    user_prompt = (
        f"This video is exactly {duration_str} long. "
        f"Score it: analyze both the visuals AND the existing audio track. "
        f"Create segments matching the ACTUAL video timeline (0 to {duration:.0f}s), "
        f"determine the audio_profile (speech? ambient? silent?), "
        f"and build a primary_prompt that describes music for the full 30 seconds."
    )

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=[
            types.Content(
                parts=[
                    types.Part.from_uri(file_uri=video_file.uri, mime_type=video_file.mime_type),
                    types.Part.from_text(text=user_prompt),
                ]
            )
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=VideoAnalysis,
        ),
    )

    try:
        client.files.delete(name=video_file.name)
    except Exception:
        pass
    Path(tmp_path).unlink(missing_ok=True)

    return VideoAnalysis.model_validate_json(response.text)
