from fastapi import APIRouter, UploadFile, HTTPException

from app.config import get_settings
from app.models.schemas import VideoAnalysis
from app.services.gemini import analyze_video

router = APIRouter(prefix="/api/video", tags=["video"])

ALLOWED_TYPES = {"video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"}


@router.post("/analyze", response_model=VideoAnalysis)
async def analyze(file: UploadFile):
    settings = get_settings()

    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported video format: {file.content_type}. Use MP4, MOV, WebM, or AVI.")

    # Read and validate size
    video_bytes = await file.read()
    size_mb = len(video_bytes) / (1024 * 1024)

    if size_mb > settings.max_video_size_mb:
        raise HTTPException(400, f"Video too large: {size_mb:.1f}MB. Maximum is {settings.max_video_size_mb}MB.")

    # Analyze with Gemini
    try:
        result = await analyze_video(video_bytes, file.filename or "video.mp4")
    except Exception as e:
        raise HTTPException(500, f"Video analysis failed: {str(e)}")

    return result
