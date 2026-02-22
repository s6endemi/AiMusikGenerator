"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  analyzeVideo,
  generateVariations,
  mergeVideoAudio,
  initializeCredits,
  getCredits,
  type VideoAnalysis,
  type MusicVariation,
} from "@/lib/api";
import VideoUpload from "@/components/VideoUpload";
import AnalysisResult from "@/components/AnalysisResult";
import VariationPicker from "@/components/VariationPicker";
import LoadingState from "@/components/LoadingState";

type Step = "upload" | "analyzing" | "edit" | "generating" | "pick" | "merging" | "done";

const PROGRESS_STEPS = [
  { label: "Upload", icon: "upload" },
  { label: "Edit", icon: "edit" },
  { label: "Generate", icon: "music" },
  { label: "Done", icon: "check" },
];

function getProgressIndex(step: Step): number {
  switch (step) {
    case "upload": return 0;
    case "analyzing": return 0;
    case "edit": return 1;
    case "generating": return 2;
    case "pick": return 2;
    case "merging": return 3;
    case "done": return 3;
  }
}

function StepIcon({ icon, active }: { icon: string; active: boolean }) {
  const color = active ? "currentColor" : "currentColor";
  const sw = "2";
  switch (icon) {
    case "upload":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case "edit":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case "music":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "check":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [bpm, setBpm] = useState(120);
  const [variations, setVariations] = useState<MusicVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<MusicVariation | null>(null);
  const [mergedVideoUrl, setMergedVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [credits, setCredits] = useState<number | null>(null);

  const userIdRef = useRef(
    typeof crypto !== "undefined" ? crypto.randomUUID() : "anonymous"
  );

  useEffect(() => {
    initializeCredits(userIdRef.current).then(setCredits);
  }, []);

  const refreshCredits = useCallback(async () => {
    const c = await getCredits(userIdRef.current);
    setCredits(c);
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setError("");
    setStep("analyzing");

    try {
      const result = await analyzeVideo(file, userIdRef.current);
      console.log("[VibeSync] Gemini style_suggestions:", JSON.stringify(result.style_suggestions, null, 2));
      setAnalysis(result);
      setPrompt(result.primary_prompt);
      setNegativePrompt(result.negative_prompt);
      setBpm(result.bpm);
      setStep("edit");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setStep("upload");
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!analysis) return;
    setError("");
    setStep("generating");

    try {
      const result = await generateVariations(
        prompt, negativePrompt, analysis.overall_mood, bpm, userIdRef.current,
        analysis.style_suggestions || [],
      );
      setVariations(result.variations);
      await refreshCredits();
      setStep("pick");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStep("edit");
    }
  }, [prompt, negativePrompt, bpm, analysis, refreshCredits]);

  const handlePickVariation = useCallback(
    async (variation: MusicVariation) => {
      if (!videoFile || !analysis) return;
      setError("");
      setSelectedVariation(variation);
      setStep("merging");

      try {
        const result = await mergeVideoAudio(
          videoFile, variation.file_id, "social", analysis.segments,
        );
        setMergedVideoUrl(result.video_url);
        setStep("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Merge failed");
        setStep("pick");
      }
    },
    [videoFile, analysis]
  );

  const handleReset = useCallback(() => {
    setStep("upload");
    setVideoFile(null);
    setVideoUrl("");
    setAnalysis(null);
    setPrompt("");
    setNegativePrompt("");
    setBpm(120);
    setVariations([]);
    setSelectedVariation(null);
    setMergedVideoUrl("");
    setError("");
  }, []);

  const progressIndex = getProgressIndex(step);

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Aurora background */}
      <div className="aurora" />
      <div className="dot-grid" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-[var(--background)]/60 backdrop-blur-2xl px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent)] to-indigo-600 flex items-center justify-center text-white font-bold text-[11px] shadow-[0_0_16px_var(--accent-glow)]">
              V
            </div>
            <span className="text-sm font-semibold tracking-tight">VibeSync</span>
            <span className="text-[9px] font-bold text-[var(--accent)] bg-[var(--accent)]/8 px-1.5 py-0.5 rounded tracking-wider border border-[var(--accent)]/15">
              PRO
            </span>
          </div>

          {credits !== null && (
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <div className={`w-1.5 h-1.5 rounded-full ${credits > 0 ? "bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]"}`} />
              <span className="tabular-nums font-medium">{credits} credits</span>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">

        {/* Progress Stepper — outside keyed div so it doesn't re-animate */}
        <div className="w-full max-w-5xl mb-10">
          <div className="max-w-sm mx-auto flex items-center">
            {PROGRESS_STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500
                      ${i < progressIndex
                        ? "step-completed text-white"
                        : i === progressIndex
                          ? "step-active text-white"
                          : "bg-white/[0.04] text-[var(--muted)] border border-white/[0.06]"
                      }
                    `}
                  >
                    {i < progressIndex ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <StepIcon icon={s.icon} active={i === progressIndex} />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium tracking-wide transition-all duration-500 ${
                      i <= progressIndex ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {i < PROGRESS_STEPS.length - 1 && (
                  <div className="flex-1 h-[2px] bg-white/[0.04] mx-3 mt-[-20px] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        i < progressIndex
                          ? "w-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1]"
                          : "w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content — keyed so only this part re-animates on step change */}
        <div className="w-full max-w-5xl animate-fade-up" key={step}>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl glass-card border-red-500/15 text-red-400 text-sm flex items-center justify-between animate-fade-up">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
              <button onClick={() => setError("")} className="text-red-400/40 hover:text-red-400 text-xs ml-4 transition-colors">
                dismiss
              </button>
            </div>
          )}

          {/* Steps */}
          {step === "upload" && <VideoUpload onUpload={handleUpload} />}

          {step === "analyzing" && (
            <LoadingState message="Analyzing your video" sub="Detecting mood, rhythm, and energy" />
          )}

          {step === "edit" && analysis && (
            <AnalysisResult
              analysis={analysis}
              videoUrl={videoUrl}
              prompt={prompt}
              negativePrompt={negativePrompt}
              bpm={bpm}
              onPromptChange={setPrompt}
              onNegativePromptChange={setNegativePrompt}
              onBpmChange={setBpm}
              onGenerate={handleGenerate}
              onBack={handleReset}
            />
          )}

          {step === "generating" && (
            <LoadingState message="Composing 3 variations" sub="AI-generated styles tailored to your video" />
          )}

          {step === "pick" && (
            <VariationPicker
              variations={variations}
              videoUrl={videoUrl}
              audioProfile={analysis?.audio_profile}
              onPick={handlePickVariation}
              onBack={() => setStep("edit")}
            />
          )}

          {step === "merging" && (
            <LoadingState message="Mixing your export" sub="Smart audio ducking + loudness matching" />
          )}

          {step === "done" && mergedVideoUrl && (
            <div className="flex flex-col items-center gap-8 stagger">
              {/* Success header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/15 text-emerald-400 text-xs font-medium mb-5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  Ready to post
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  Your video is ready
                </h2>
                <p className="text-[var(--muted)] text-sm">
                  AI soundtrack mixed with adaptive loudness
                </p>
              </div>

              {/* Video preview */}
              <div className="relative">
                <div className="absolute -inset-6 rounded-3xl bg-[var(--accent)]/[0.04] blur-3xl breathe pointer-events-none" />
                <video
                  src={mergedVideoUrl}
                  controls
                  className="relative z-10 w-full max-w-lg rounded-xl border border-white/[0.08] shadow-2xl"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={mergedVideoUrl}
                  download="vibesync_export.mp4"
                  className="btn-primary px-6"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Video
                </a>
                {selectedVariation && (
                  <a
                    href={selectedVariation.audio_url}
                    download="vibesync_track.mp3"
                    className="btn-secondary"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                    Track Only
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="px-5 py-3 rounded-xl text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-all hover:bg-white/[0.03]"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
