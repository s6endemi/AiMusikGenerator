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
    <main className="min-h-screen flex flex-col relative overflow-x-hidden">
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
      <div className={`flex-1 flex flex-col items-center ${step !== "upload" ? "justify-center" : ""} p-6 relative z-10`}>

        {/* Progress Stepper — hidden on landing */}
        {step !== "upload" && (
        <div className="w-full max-w-5xl mb-8">
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
        )}

        {/* Content — keyed so only this part re-animates on step change */}
        <div className={`w-full max-w-5xl animate-content-enter ${step === "upload" ? "min-h-[calc(100vh-120px)] flex flex-col items-center justify-center relative" : ""}`} key={step}>

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
          {step === "upload" && (
            <>
              <VideoUpload onUpload={handleUpload} />
              <button
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[var(--muted)] hover:text-[var(--muted-foreground)] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-bounce">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </>
          )}

          {step === "analyzing" && (
            <LoadingState
              message="Analyzing your video"
              substeps={[
                "Processing video",
                "Detecting mood & energy",
                "Analyzing cut rhythm",
                "Composing music prompt",
              ]}
            />
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
            <LoadingState
              message="Composing your soundtrack"
              substeps={[
                "Preparing prompts",
                "Composing track 1 of 3",
                "Composing track 2 of 3",
                "Composing track 3 of 3",
              ]}
              stepDurations={[3000, 18000, 18000]}
              hint="This usually takes 1–2 minutes"
            />
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
            <LoadingState
              message="Mixing your export"
              sub="Loudness matching + smart audio ducking"
            />
          )}

          {step === "done" && mergedVideoUrl && (
            <div className="flex flex-col items-center gap-5">
              {/* Success header — compact */}
              <div className="text-center animate-success">
                <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/15 text-emerald-400 text-xs font-medium mb-3">
                  <div className="absolute inset-0 rounded-full border border-emerald-500/30 success-ring" />
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center check-pop">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  Ready to post
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">
                  Your video is ready
                </h2>
                {selectedVariation && (
                  <p className="text-[var(--muted)] text-sm">
                    {selectedVariation.style_label} &middot; AI-matched soundtrack
                  </p>
                )}
              </div>

              {/* Video preview — compact */}
              <div className="relative animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
                <div className="absolute -inset-4 rounded-2xl bg-[var(--accent)]/[0.04] blur-2xl breathe pointer-events-none" />
                <video
                  src={mergedVideoUrl}
                  controls
                  autoPlay
                  className="relative z-10 w-auto max-w-md max-h-[45vh] rounded-xl border border-white/[0.08] shadow-2xl"
                />
              </div>

              {/* Actions — tight */}
              <div className="flex items-center gap-2.5 animate-fade-up" style={{ animationDelay: "0.18s", animationFillMode: "both" }}>
                <a
                  href={mergedVideoUrl}
                  download="vibesync_export.mp4"
                  className="btn-primary px-5 py-3 hover-lift"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </a>
                {selectedVariation && (
                  <a
                    href={selectedVariation.audio_url}
                    download="vibesync_track.mp3"
                    className="btn-secondary py-3 hover-lift"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                    Track Only
                  </a>
                )}
              </div>

              {/* Create another — separate, clear */}
              <button
                onClick={handleReset}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors animate-fade-up"
                style={{ animationDelay: "0.25s", animationFillMode: "both" }}
              >
                Create another soundtrack
              </button>
            </div>
          )}
        </div>

        {/* ─── Landing Page Sections ─── */}
        {step === "upload" && (
          <>
            {/* How it works */}
            <section className="w-full max-w-4xl py-24 px-2">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight mb-3">Three steps. Zero effort.</h2>
                <p className="text-[var(--muted-foreground)] text-sm">From raw footage to finished soundtrack in under two minutes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1: Upload */}
                <div className="group">
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] flex items-center justify-center relative overflow-hidden mb-4 transition-colors group-hover:border-white/[0.1]">
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.06), transparent 70%)' }} />
                    <div className="relative w-14 h-14 rounded-2xl bg-[var(--accent)]/[0.1] border border-[var(--accent)]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)]">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/8 w-5 h-5 rounded-md flex items-center justify-center border border-[var(--accent)]/15">1</span>
                    <h3 className="font-semibold text-sm tracking-tight">Drop your video</h3>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed pl-7">Any clip up to 30 seconds. MP4, MOV, or WebM.</p>
                </div>

                {/* Step 2: Analyze */}
                <div className="group">
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] flex items-end justify-center relative overflow-hidden mb-4 px-6 pb-10 transition-colors group-hover:border-white/[0.1]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[var(--accent)]/[0.08] rounded-full blur-3xl" />
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="relative flex-1 mx-[1px] rounded-full bg-[var(--accent)]/20 group-hover:bg-[var(--accent)]/30 transition-colors duration-500" style={{ height: `${Math.round(20 + Math.sin(i * 0.7) * 35 + Math.cos(i * 0.4) * 25)}%` }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/8 w-5 h-5 rounded-md flex items-center justify-center border border-[var(--accent)]/15">2</span>
                    <h3 className="font-semibold text-sm tracking-tight">AI analyzes everything</h3>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed pl-7">Mood, pacing, energy, and scene transitions — detected automatically.</p>
                </div>

                {/* Step 3: Download */}
                <div className="group">
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] flex items-center justify-center relative overflow-hidden mb-4 transition-colors group-hover:border-white/[0.1]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-500/[0.06] rounded-full blur-3xl" />
                    <div className="relative flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/[0.1] border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted-foreground)]">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/8 w-5 h-5 rounded-md flex items-center justify-center border border-[var(--accent)]/15">3</span>
                    <h3 className="font-semibold text-sm tracking-tight">Pick & download</h3>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed pl-7">3 AI-composed tracks. Smart audio mixing. Export-ready.</p>
                </div>
              </div>
            </section>

            {/* Bottom CTA */}
            <section className="w-full max-w-3xl text-center pb-24 pt-8">
              <p className="text-lg font-semibold tracking-tight mb-5">Ready to try?</p>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-primary px-8 py-3.5 hover-lift">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload your first video
              </button>
              <p className="text-[11px] text-[var(--muted)] mt-4 tracking-wide">3 free credits &middot; No account required</p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
