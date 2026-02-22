import json

from fastapi import APIRouter, HTTPException, Request, UploadFile, Form
from fastapi.responses import FileResponse
from pathlib import Path

from app.config import get_settings
from app.models.schemas import (
    GenerateMusicRequest, GenerateMusicResponse,
    GenerateVariationsRequest, GenerateVariationsResponse, MusicVariation,
    MergeRequest, MergeResponse,
)
from app.services.lyria import generate_music, generate_variations, OUTPUT_DIR
from app.services.merge import merge_video_audio
from app.services.credits import deduct_credit

router = APIRouter(prefix="/api/music", tags=["music"])


@router.post("/generate", response_model=GenerateMusicResponse)
async def generate(req: GenerateMusicRequest, request: Request):
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(401, "Authentication required")

    success = await deduct_credit(user_id)
    if not success:
        raise HTTPException(402, "No credits remaining. Purchase more to continue.")

    try:
        result = await generate_music(req.prompt, req.negative_prompt)
    except Exception as e:
        raise HTTPException(500, f"Music generation failed: {str(e)}")

    settings = get_settings()
    return GenerateMusicResponse(
        audio_url=f"{settings.backend_url}/api/music/download/{result['file_id']}/mp3",
        duration_seconds=result["duration_seconds"],
        format="mp3",
        file_id=result["file_id"],
    )


@router.post("/generate-variations", response_model=GenerateVariationsResponse)
async def gen_variations(req: GenerateVariationsRequest, request: Request):
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(401, "Authentication required")

    # Deduct 1 credit for all 3 variations (not 3 credits)
    success = await deduct_credit(user_id)
    if not success:
        raise HTTPException(402, "No credits remaining. Purchase more to continue.")

    try:
        style_suggestions = [s.model_dump() if hasattr(s, 'model_dump') else (s.dict() if hasattr(s, 'dict') else s) for s in (req.style_suggestions or [])]
        import logging
        logging.getLogger(__name__).info(f"[API] style_suggestions passed to lyria: {style_suggestions}")
        results = await generate_variations(req.prompt, req.negative_prompt, style_suggestions)
    except Exception as e:
        raise HTTPException(500, f"Music generation failed: {str(e)}")

    settings = get_settings()
    variations = [
        MusicVariation(
            file_id=r["file_id"],
            audio_url=f"{settings.backend_url}/api/music/download/{r['file_id']}/mp3",
            style_label=r["style_label"],
            duration_seconds=r["duration_seconds"],
        )
        for r in results
    ]

    return GenerateVariationsResponse(variations=variations)


@router.post("/merge", response_model=MergeResponse)
async def merge(
    video: UploadFile,
    file_id: str = Form(...),
    mix_mode: str = Form("balanced"),
    segments_json: str = Form("[]"),
):
    video_bytes = await video.read()

    # Parse segments from Gemini analysis
    try:
        segments = json.loads(segments_json) if segments_json else []
    except (json.JSONDecodeError, TypeError):
        segments = []

    try:
        result = await merge_video_audio(
            video_bytes=video_bytes,
            video_filename=video.filename or "video.mp4",
            music_file_id=file_id,
            mix_mode=mix_mode,
            segments=segments,
        )
    except FileNotFoundError:
        raise HTTPException(404, "Music file not found. Generate music first.")
    except Exception as e:
        raise HTTPException(500, f"Merge failed: {str(e)}")

    settings = get_settings()
    return MergeResponse(
        video_url=f"{settings.backend_url}/api/music/download-merged/{result['file_id']}",
        duration_seconds=result["duration_seconds"],
    )


@router.get("/download/{file_id}/{format}")
async def download(file_id: str, format: str):
    if format not in ("mp3", "wav"):
        raise HTTPException(400, "Format must be 'mp3' or 'wav'")

    file_path = OUTPUT_DIR / f"{file_id}.{format}"
    if not file_path.exists():
        raise HTTPException(404, "Audio file not found")

    media_type = "audio/mpeg" if format == "mp3" else "audio/wav"
    return FileResponse(file_path, media_type=media_type, filename=f"vibesync_{file_id}.{format}")


@router.get("/download-merged/{file_id}")
async def download_merged(file_id: str):
    file_path = OUTPUT_DIR / f"{file_id}_merged.mp4"
    if not file_path.exists():
        raise HTTPException(404, "Merged video not found")

    return FileResponse(file_path, media_type="video/mp4", filename=f"vibesync_{file_id}.mp4")
