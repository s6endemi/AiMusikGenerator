import json
import math
import re
import subprocess
import uuid
from pathlib import Path

from app.services.lyria import OUTPUT_DIR

# --- Adaptive mixing based on measured loudness (LUFS) ---

# Social media loudness target (YouTube, Instagram, TikTok all use -14 LUFS)
TARGET_LUFS = -14

# How many dB below/above original audio should music be per mix mode
MODE_OFFSET_DB = {
    "social": 0,         # Social media: music at same level as original, sidechain handles speech
    "background": -6,
    "balanced": -2,
    "feature": 3,
}

# Additional dB offset per energy level (relative to mode base)
ENERGY_OFFSET_DB = {
    "calm": -1,
    "building": 1,
    "intense": 3,
    "peak": 5,
    "fading": -2,
}

# Sidechain compression (speech ducking)
# Social: music is prominent, ducks firmly during speech, rebounds fast
DUCKING_PARAMS = {
    "social": "threshold=0.05:ratio=3.5:attack=150:release=600",
    "background": "threshold=0.08:ratio=3:attack=200:release=800",
    "balanced": "threshold=0.06:ratio=2.5:attack=250:release=900",
    "feature": "threshold=0.12:ratio=2:attack=300:release=1000",
}


def _db_to_linear(db: float) -> float:
    """Convert decibels to linear volume multiplier."""
    return 10 ** (db / 20)


def _has_audio_stream(file_path: str) -> bool:
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-select_streams", "a",
             "-show_entries", "stream=codec_type", "-of", "json", file_path],
            capture_output=True, text=True,
        )
        data = json.loads(result.stdout)
        return len(data.get("streams", [])) > 0
    except Exception:
        return False


def _get_duration(file_path: str) -> float:
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
             "-of", "csv=p=0", file_path],
            capture_output=True, text=True,
        )
        return float(result.stdout.strip()) if result.stdout.strip() else 30.0
    except Exception:
        return 30.0


def _measure_loudness(file_path: str) -> float:
    """Measure integrated loudness in LUFS using EBU R128 standard.

    Returns the perceived loudness of the audio, which is more accurate
    than simple peak or RMS measurement. This is the same standard
    used by Spotify, YouTube, Netflix, etc.
    """
    try:
        result = subprocess.run(
            ["ffmpeg", "-i", file_path, "-af", "loudnorm=print_format=json",
             "-f", "null", "-"],
            capture_output=True, text=True,
        )
        # loudnorm prints JSON in stderr
        json_match = re.search(r'\{[^{}]*"input_i"[^{}]*\}', result.stderr, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            lufs = float(data.get("input_i", -20))
            return lufs
    except Exception:
        pass
    return -20.0  # Safe fallback


def _calculate_volume_db(original_lufs: float, music_lufs: float,
                          mix_mode: str, energy: str = "building") -> float:
    """Calculate the dB adjustment for music volume.

    Instead of hardcoded percentages, this calculates the exact dB
    difference needed so the music sits at the right level relative
    to the original audio.

    Example:
      Original: -18 LUFS, Music: -25 LUFS, Mode: balanced (offset -2dB)
      Target music LUFS: -18 + (-2) = -20 LUFS
      Adjustment: -20 - (-25) = +5 dB boost
    """
    mode_offset = MODE_OFFSET_DB.get(mix_mode, -2)
    energy_offset = ENERGY_OFFSET_DB.get(energy.lower(), 0)
    target_lufs = original_lufs + mode_offset + energy_offset
    adjustment_db = target_lufs - music_lufs
    # Clamp to sane range (-20 to +15 dB)
    return max(-20, min(15, adjustment_db))


def _build_volume_expression(segments: list[dict], original_lufs: float,
                              music_lufs: float, mix_mode: str) -> str:
    """Build time-based volume expression from segments using measured loudness.

    Each segment gets a volume based on its energy level, all calculated
    relative to the actual audio levels — no hardcoded values.
    """
    if not segments or len(segments) < 2:
        db = _calculate_volume_db(original_lufs, music_lufs, mix_mode)
        return str(round(_db_to_linear(db), 3))

    # Build nested if() expression
    expr = ""
    for i, seg in enumerate(segments):
        energy = seg.get("energy", "building")
        db = _calculate_volume_db(original_lufs, music_lufs, mix_mode, energy)
        linear = round(_db_to_linear(db), 3)

        if i == len(segments) - 1:
            expr += str(linear)
        else:
            expr += f"if(lt(t,{seg['end_seconds']}),{linear},"

    expr += ")" * (len(segments) - 1)
    return expr


async def merge_video_audio(
    video_bytes: bytes,
    video_filename: str,
    music_file_id: str,
    mix_mode: str = "balanced",
    music_volume: float | None = None,
    keep_original_audio: bool = True,
    fade_in: float = 0.5,
    fade_out: float = 1.0,
    segments: list[dict] | None = None,
) -> dict:
    """Merge video with generated music using adaptive loudness mixing.

    Three-layer intelligent mixing:
      1. Loudness measurement (LUFS) — adapts to any input level
      2. Segment energy curve — volume follows the video narrative
      3. Sidechain compression — real-time ducking for speech
    """

    # Resolve music path
    mp3_path = OUTPUT_DIR / f"{music_file_id}.mp3"
    if not mp3_path.exists():
        raise FileNotFoundError(f"Music file not found: {music_file_id}")

    # Save video to temp
    file_id = uuid.uuid4().hex[:12]
    video_ext = Path(video_filename).suffix or ".mp4"
    video_path = OUTPUT_DIR / f"{file_id}_input{video_ext}"
    output_path = OUTPUT_DIR / f"{file_id}_merged.mp4"
    video_path.write_bytes(video_bytes)

    # Analyze input
    video_duration = _get_duration(str(video_path))
    video_has_audio = _has_audio_stream(str(video_path))

    # --- LOUDNESS MEASUREMENT (the key innovation) ---
    music_lufs = _measure_loudness(str(mp3_path))

    if video_has_audio:
        original_lufs = _measure_loudness(str(video_path))
    else:
        original_lufs = -40.0  # Effectively silent

    print(f"[MERGE] file_id={file_id}")
    print(f"[MERGE] video: {video_duration:.1f}s, has_audio={video_has_audio}, loudness={original_lufs:.1f} LUFS")
    print(f"[MERGE] music: loudness={music_lufs:.1f} LUFS")
    print(f"[MERGE] mix_mode={mix_mode}, segments={len(segments) if segments else 0}")

    # --- BUILD FILTER CHAIN ---
    fade_start = max(0, video_duration - fade_out)
    has_segments = segments and len(segments) >= 2

    # Step 1: Trim music + fade
    music_chain = (
        f"[1:a]atrim=0:{video_duration},asetpts=PTS-STARTPTS,"
        f"afade=t=in:st=0:d={fade_in},"
        f"afade=t=out:st={fade_start}:d={fade_out}"
    )

    # Step 2: Adaptive volume (measured, not hardcoded)
    if has_segments:
        vol_expr = _build_volume_expression(segments, original_lufs, music_lufs, mix_mode)
        music_chain += f",volume='{vol_expr}':eval=frame"
        print(f"[MERGE] Adaptive volume curve: {vol_expr}")
    else:
        db = _calculate_volume_db(original_lufs, music_lufs, mix_mode)
        linear = round(_db_to_linear(db), 3)
        music_chain += f",volume={linear}"
        print(f"[MERGE] Adaptive flat volume: {linear} ({db:+.1f} dB)")

    # Step 3: Sidechain compression + mix
    if video_has_audio and keep_original_audio:
        duck_params = DUCKING_PARAMS.get(mix_mode, DUCKING_PARAMS["balanced"])

        filter_complex = (
            f"[0:a]asplit=2[orig][sc];"
            f"{music_chain}[music_raw];"
            f"[music_raw][sc]sidechaincompress={duck_params}[music_ducked];"
            f"[orig][music_ducked]amix=inputs=2:duration=first:normalize=0[out]"
        )
        map_args = ["-map", "0:v", "-map", "[out]"]
        print(f"[MERGE] Mode: Adaptive ducking ({mix_mode})")
    else:
        music_chain += "[music]"
        filter_complex = music_chain
        map_args = ["-map", "0:v", "-map", "[music]"]
        print("[MERGE] Mode: Music only")

    cmd = [
        "ffmpeg", "-i", str(video_path), "-i", str(mp3_path),
        "-filter_complex", filter_complex,
        *map_args,
        "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
        "-shortest", "-y", str(output_path),
    ]

    print("[MERGE] Running ffmpeg...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(f"[MERGE] ffmpeg returncode={result.returncode}")

    if result.returncode != 0:
        print(f"[MERGE] ffmpeg STDERR: {result.stderr[-800:]}")
        # Fallback: simple merge without smart ducking
        print("[MERGE] Fallback: simple volume merge...")
        db = _calculate_volume_db(original_lufs, music_lufs, mix_mode)
        linear = round(_db_to_linear(db), 3)
        cmd = [
            "ffmpeg", "-i", str(video_path), "-i", str(mp3_path),
            "-filter_complex",
            f"[1:a]atrim=0:{video_duration},asetpts=PTS-STARTPTS,"
            f"volume={linear},"
            f"afade=t=in:st=0:d={fade_in},"
            f"afade=t=out:st={fade_start}:d={fade_out}[music]",
            "-map", "0:v", "-map", "[music]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
            "-shortest", "-y", str(output_path),
        ]
        fallback = subprocess.run(cmd, capture_output=True, text=True)
        if fallback.returncode != 0:
            raise RuntimeError(f"ffmpeg merge failed: {fallback.stderr[-500:]}")

    # Verify output
    if not output_path.exists():
        raise RuntimeError("Merge produced no output file")

    has_audio = _has_audio_stream(str(output_path))
    output_size = output_path.stat().st_size
    print(f"[MERGE] Output: {output_size} bytes, has_audio={has_audio}")

    if not has_audio:
        raise RuntimeError("Merged video has no audio stream")

    # Clean up
    video_path.unlink(missing_ok=True)

    return {
        "file_id": file_id,
        "output_path": str(output_path),
        "duration_seconds": video_duration,
    }
