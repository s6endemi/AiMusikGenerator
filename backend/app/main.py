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

# CORS — support multiple origins (localhost + production)
allowed_origins = [o.strip() for o in settings.frontend_url.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
