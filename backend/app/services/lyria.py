import base64
import os
import random
import subprocess
import tempfile
import uuid
from pathlib import Path

from google.cloud import aiplatform
from google.protobuf import json_format
from google.protobuf.struct_pb2 import Value

from app.config import get_settings

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OUTPUT_DIR = Path(tempfile.gettempdir()) / "vibesync_audio"
OUTPUT_DIR.mkdir(exist_ok=True)

MAX_RETRIES = 4

_RETRY_VARIATIONS = [
    " with unique original composition style",
    " featuring unconventional rhythm patterns",
    " with experimental sound design elements",
    " in a fresh contemporary arrangement",
    " with distinctive melodic progression",
    " using creative and novel instrumentation choices",
]

# Subtle modifier for "Original" to avoid recitation without changing the style
_ORIGINAL_MODIFIER = " Create a fully original composition. Use creative interpretation and unique arrangement."

# Style modifiers — each must produce a fundamentally different track
STYLE_VARIATIONS = [
    {
        "label": "Original",
        "modifier": "",
    },
    {
        "label": "Lo-fi",
        "modifier": " Completely reimagine this as lo-fi chill. Use ONLY: mellow Rhodes piano, soft vinyl-crackle texture, tape-saturated drums at half tempo, warm sub bass. Remove all sharp or bright sounds. Downtempo, dreamy, bedroom-producer aesthetic.",
    },
    {
        "label": "Hype",
        "modifier": " Completely reimagine this as high-energy hype music. Use ONLY: hard-hitting 808 bass, aggressive trap hi-hats, stadium synth leads, build-ups with risers and drops. Maximum energy, festival-ready, designed to make people stop scrolling.",
    },
]


def _get_client():
    settings = get_settings()
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
    aiplatform.init(project=settings.google_cloud_project, location="us-central1")

    return (
        aiplatform.gapic.PredictionServiceClient(
            client_options={"api_endpoint": "us-central1-aiplatform.googleapis.com"}
        ),
        f"projects/{settings.google_cloud_project}/locations/us-central1/publishers/google/models/lyria-002",
    )


def _truncate_prompt(prompt: str, max_len: int = 2000) -> str:
    """Truncate prompt to max_len, cutting at last sentence boundary."""
    if len(prompt) <= max_len:
        return prompt
    truncated = prompt[:max_len]
    # Cut at last period/sentence to keep prompt coherent
    last_period = truncated.rfind(".")
    if last_period > max_len * 0.6:
        return truncated[:last_period + 1]
    return truncated


async def _generate_single(client, endpoint, prompt: str, negative_prompt: str, label: str = "") -> dict | None:
    """Generate a single track with retry logic. Returns None if all retries fail."""

    prompt = _truncate_prompt(prompt)
    parameters_pb = json_format.ParseDict({"sample_count": 1}, Value())

    for attempt in range(MAX_RETRIES):
        current_prompt = prompt
        if attempt > 0:
            # Only add anti-recitation modifiers after first failure
            current_prompt = f"{prompt} {_RETRY_VARIATIONS[(attempt - 1) % len(_RETRY_VARIATIONS)]}"

        instances = [{"prompt": current_prompt}]
        if negative_prompt:
            instances[0]["negative_prompt"] = negative_prompt

        instances_pb = [json_format.ParseDict(inst, Value()) for inst in instances]

        try:
            response = client.predict(
                endpoint=endpoint, instances=instances_pb, parameters=parameters_pb
            )
            audio_b64 = response.predictions[0]["bytesBase64Encoded"]
            audio_bytes = base64.b64decode(audio_b64)

            file_id = uuid.uuid4().hex[:12]
            wav_path = OUTPUT_DIR / f"{file_id}.wav"
            mp3_path = OUTPUT_DIR / f"{file_id}.mp3"

            wav_path.write_bytes(audio_bytes)

            subprocess.run(
                ["ffmpeg", "-i", str(wav_path), "-codec:a", "libmp3lame", "-b:a", "320k", str(mp3_path), "-y"],
                capture_output=True, check=True,
            )

            if attempt > 0:
                logger.info(f"[LYRIA] '{label}' succeeded on retry {attempt}")
            return {
                "file_id": file_id,
                "wav_path": str(wav_path),
                "mp3_path": str(mp3_path),
                "duration_seconds": 30.0,
            }
        except Exception as e:
            err_str = str(e).lower()
            if "recitation" in err_str and attempt < MAX_RETRIES - 1:
                logger.warning(f"[LYRIA] '{label}' recitation on attempt {attempt + 1}/{MAX_RETRIES}, retrying...")
                continue
            if attempt == MAX_RETRIES - 1:
                logger.error(f"[LYRIA] '{label}' failed after {MAX_RETRIES} attempts: {e}")
                return None
            raise

    return None


async def generate_music(prompt: str, negative_prompt: str = "") -> dict:
    """Generate a single music track."""
    client, endpoint = _get_client()
    result = await _generate_single(client, endpoint, prompt, negative_prompt)
    if result is None:
        raise RuntimeError("Music generation failed after all retries")
    return result


async def generate_variations(
    prompt: str,
    negative_prompt: str = "",
    style_suggestions: list[dict] | None = None,
) -> list[dict]:
    """Generate 3 style variations: Original + 2 AI-suggested alternatives."""

    client, endpoint = _get_client()

    # Build variation list: Original (pure prompt, modifier only on retry) + AI suggestions
    variations = [{"label": "Original", "modifier": ""}]

    logger.info(f"[LYRIA] style_suggestions received: {style_suggestions}")

    if style_suggestions and len(style_suggestions) >= 2:
        for s in style_suggestions[:2]:
            modifier = s.get("modifier", "")
            label = s.get("label", "Alt")
            logger.info(f"[LYRIA] Using AI style: '{label}' -> modifier length={len(modifier)}")
            variations.append({
                "label": label,
                "modifier": " " + modifier if modifier else "",
            })
    else:
        logger.info("[LYRIA] No AI suggestions, using hardcoded fallback styles")
        for s in STYLE_VARIATIONS[1:]:
            variations.append(s)

    results = []
    for idx, style in enumerate(variations):
        styled_prompt = prompt + style["modifier"]
        logger.info(f"[LYRIA] === Variation {idx + 1}/3: '{style['label']}' ===")
        logger.info(f"[LYRIA]   modifier empty: {style['modifier'] == ''}")
        logger.info(f"[LYRIA]   modifier: '{style['modifier'][:120]}'")
        logger.info(f"[LYRIA]   final prompt (last 200 chars): '...{styled_prompt[-200:]}'")
        logger.info(f"[LYRIA]   total prompt length: {len(styled_prompt)}")
        result = await _generate_single(client, endpoint, styled_prompt, negative_prompt, label=style["label"])
        if result:
            result["style_label"] = style["label"]
            results.append(result)
            logger.info(f"[LYRIA]   -> OK, file_id={result['file_id']}")
        else:
            logger.warning(f"[LYRIA]   -> FAILED, variation skipped")

    if not results:
        raise RuntimeError("All variations failed to generate")

    return results
