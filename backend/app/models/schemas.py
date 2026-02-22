from pydantic import BaseModel, Field


# === Gemini Analysis ===

class VideoSegment(BaseModel):
    start_seconds: float = Field(..., description="Segment start time")
    end_seconds: float = Field(..., description="Segment end time")
    energy: str = Field(..., description="Energy level: calm, building, intense, peak, fading")
    mood: str = Field(..., description="Emotional tone of this segment")
    visual_description: str = Field(..., description="What happens visually")
    musical_suggestion: str = Field(..., description="Specific instruments/sounds for this moment")


class AudioProfile(BaseModel):
    has_speech: bool = Field(..., description="Whether the video contains speech or voiceover")
    has_ambient_sound: bool = Field(..., description="Whether the video has significant ambient/environmental sound")
    is_silent: bool = Field(..., description="Whether the video is mostly silent")
    recommended_mix: str = Field(..., description="One of: background, balanced, feature")
    mix_reasoning: str = Field("", description="Why this mix mode was recommended")


class StyleSuggestion(BaseModel):
    label: str = Field(..., description="Short style name, 2-3 words, e.g. 'Jazz Lounge', 'Ambient Drift'")
    modifier: str = Field(..., description="Prompt modifier that dramatically changes musical direction, max 200 chars")


class VideoAnalysis(BaseModel):
    bpm: int = Field(..., ge=40, le=220, description="Beats per minute matching the visual rhythm")
    key: str = Field("C minor", description="Suggested musical key")
    overall_mood: str = Field(..., description="Dominant emotional tone")
    energy_arc: str = Field(..., description="Energy curve e.g. 'slow build → peak at 0:18 → gentle fade'")
    audio_profile: AudioProfile = Field(..., description="Analysis of the video's existing audio")
    segments: list[VideoSegment] = Field(..., description="Time-based segments of the video")
    style_suggestions: list[StyleSuggestion] = Field(default_factory=list, description="2 contrasting style alternatives")
    primary_prompt: str = Field(..., description="Complete Lyria prompt with temporal structure")
    negative_prompt: str = Field("", description="What to avoid in the music")
    reasoning: str = Field("", description="Detailed reasoning for musical choices")


# === Music Generation ===

class GenerateMusicRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=2000)
    negative_prompt: str = Field("", max_length=500)


class GenerateMusicResponse(BaseModel):
    audio_url: str
    duration_seconds: float
    format: str
    file_id: str = ""


class GenerateVariationsRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=2000)
    negative_prompt: str = Field("", max_length=500)
    mood: str = Field("", description="Overall mood for style variation")
    bpm: int = Field(120, ge=40, le=220)
    style_suggestions: list[StyleSuggestion] = Field(default_factory=list, description="AI-suggested style alternatives")


class MusicVariation(BaseModel):
    file_id: str
    audio_url: str
    style_label: str
    duration_seconds: float


class GenerateVariationsResponse(BaseModel):
    variations: list[MusicVariation]


# === Merge ===

class MergeRequest(BaseModel):
    file_id: str = Field(..., description="Music file ID to merge")
    mix_mode: str = Field("balanced", description="background (20%), balanced (50%), feature (80%)")
    music_volume: float = Field(0.5, ge=0.0, le=1.0, description="Music volume 0-1")
    keep_original_audio: bool = Field(True, description="Keep original video audio")
    fade_in: float = Field(0.5, ge=0.0, le=3.0, description="Fade in seconds")
    fade_out: float = Field(1.0, ge=0.0, le=3.0, description="Fade out seconds")


class MergeResponse(BaseModel):
    video_url: str
    duration_seconds: float


# === Credits ===

class CreditBalance(BaseModel):
    credits: int
    user_id: str


class CheckoutSessionResponse(BaseModel):
    checkout_url: str
