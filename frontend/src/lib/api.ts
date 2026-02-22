const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzeVideo(
  file: File,
  userToken: string
): Promise<VideoAnalysis> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/video/analyze`, {
    method: "POST",
    headers: { "x-user-id": userToken },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Video analysis failed");
  }

  return res.json();
}

export async function generateVariations(
  prompt: string,
  negativePrompt: string,
  mood: string,
  bpm: number,
  userToken: string,
  styleSuggestions: StyleSuggestion[] = [],
): Promise<VariationsResult> {
  const res = await fetch(`${API_URL}/api/music/generate-variations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userToken,
    },
    body: JSON.stringify({
      prompt,
      negative_prompt: negativePrompt,
      mood,
      bpm,
      style_suggestions: styleSuggestions,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Generation failed" }));
    throw new Error(err.detail || "Music generation failed");
  }

  return res.json();
}

export async function mergeVideoAudio(
  videoFile: File,
  fileId: string,
  mixMode: string,
  segments: VideoSegment[] = [],
): Promise<MergeResult> {
  const formData = new FormData();
  formData.append("video", videoFile);
  formData.append("file_id", fileId);
  formData.append("mix_mode", mixMode);
  formData.append("segments_json", JSON.stringify(segments));

  const res = await fetch(`${API_URL}/api/music/merge`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Merge failed" }));
    throw new Error(err.detail || "Video merge failed");
  }

  return res.json();
}

export async function getCredits(userToken: string): Promise<number> {
  const res = await fetch(`${API_URL}/api/credits/balance`, {
    headers: { "x-user-id": userToken },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.credits;
}

export async function initializeCredits(userToken: string): Promise<number> {
  const res = await fetch(`${API_URL}/api/credits/initialize`, {
    method: "POST",
    headers: { "x-user-id": userToken },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.credits;
}

export async function createCheckout(userToken: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/credits/checkout`, {
    method: "POST",
    headers: { "x-user-id": userToken },
  });
  if (!res.ok) throw new Error("Checkout failed");
  const data = await res.json();
  return data.checkout_url;
}

// Types
export interface VideoSegment {
  start_seconds: number;
  end_seconds: number;
  energy: string;
  mood: string;
  visual_description: string;
  musical_suggestion: string;
}

export interface AudioProfile {
  has_speech: boolean;
  has_ambient_sound: boolean;
  is_silent: boolean;
  recommended_mix: string;
  mix_reasoning: string;
}

export interface StyleSuggestion {
  label: string;
  modifier: string;
}

export interface VideoAnalysis {
  bpm: number;
  key: string;
  overall_mood: string;
  energy_arc: string;
  audio_profile: AudioProfile;
  segments: VideoSegment[];
  style_suggestions: StyleSuggestion[];
  primary_prompt: string;
  negative_prompt: string;
  reasoning: string;
}

export interface MusicVariation {
  file_id: string;
  audio_url: string;
  style_label: string;
  duration_seconds: number;
}

export interface VariationsResult {
  variations: MusicVariation[];
}

export interface MergeResult {
  video_url: string;
  duration_seconds: number;
}
