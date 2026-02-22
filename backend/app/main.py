from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api import video, music, credits

settings = get_settings()

app = FastAPI(
    title="VibeSync Pro API",
    version="1.0.0",
    description="Social Media Music Agent – Video to Music AI Pipeline",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(video.router)
app.include_router(music.router)
app.include_router(credits.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
