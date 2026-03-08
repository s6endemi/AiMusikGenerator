"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  analyzeVideo,
  generateVariations,
  mergeVideoAudio,
  initializeCredits,
  getCredits,
  type VideoAnalysis,
  type MusicVariation,
} from "@/lib/api";
import { createClient } from "@/lib/supabase";
import { ShaderBackground } from "@/components/ShaderBackground";
import VideoUpload from "@/components/VideoUpload";
import AnalysisResult from "@/components/AnalysisResult";
import VariationPicker from "@/components/VariationPicker";
import LoadingState from "@/components/LoadingState";
import AuthModal from "@/components/AuthModal";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { motion } from "framer-motion";
import type { Session } from "@supabase/supabase-js";

type Step = "upload" | "analyzing" | "edit" | "generating" | "pick" | "merging" | "done";

const PROGRESS_STEPS = [
  { label: "Upload", icon: "upload" },
  { label: "Edit", icon: "edit" },
  { label: "Generate", icon: "music" },
  { label: "Done", icon: "check" },
];

const ANALYZE_SUBSTEPS = [
  "Processing video",
  "Detecting mood & energy",
  "Analyzing cut rhythm",
  "Composing music prompt",
];

const GENERATE_SUBSTEPS = [
  "Preparing prompts",
  "Composing track 1 of 3",
  "Composing track 2 of 3",
  "Composing track 3 of 3",
];

const GENERATE_DURATIONS = [3000, 18000, 18000];

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
  const sw = "1.5";
  switch (icon) {
    case "upload":
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case "edit":
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case "music":
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "check":
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
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
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingGenerateRef = useRef(false);
  const user = session?.user ?? null;

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.access_token) {
        initializeCredits(s.access_token).then(setCredits);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.access_token) {
        initializeCredits(s.access_token).then(setCredits);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshCredits = useCallback(async () => {
    if (!session?.access_token) return;
    const c = await getCredits(session.access_token);
    setCredits(c);
  }, [session]);

  const handleUpload = useCallback(async (file: File) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setError("");
    setStep("analyzing");

    try {
      const result = await analyzeVideo(file);
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

  const doGenerate = useCallback(async (token: string) => {
    if (!analysis) return;
    setError("");
    setStep("generating");

    try {
      const result = await generateVariations(
        prompt, negativePrompt, analysis.overall_mood, bpm, token,
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

  const handleGenerate = useCallback(async () => {
    if (!analysis) return;

    if (!session?.access_token) {
      pendingGenerateRef.current = true;
      setShowAuthModal(true);
      return;
    }

    await doGenerate(session.access_token);
  }, [analysis, session, doGenerate]);

  useEffect(() => {
    if (session?.access_token && pendingGenerateRef.current) {
      pendingGenerateRef.current = false;
      doGenerate(session.access_token);
    }
  }, [session, doGenerate]);

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
      {/* Background layers */}
      <ShaderBackground />
      <div className="depth-vignette" />
      <div className="radial-horizon" />

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto flex items-center justify-between"
        >
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={handleReset}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent)] to-indigo-600 flex items-center justify-center text-white font-bold text-[11px] shadow-[0_0_12px_var(--accent-glow)]">
              V
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.03em]">VibeSync</span>
            <span className="text-[8px] font-bold text-[var(--accent)]/80 bg-[var(--accent)]/8 px-1.5 py-0.5 rounded-full tracking-widest uppercase">
              Pro
            </span>
          </motion.div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && credits !== null && (
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)] px-3 py-1.5 rounded-full bg-white/[0.04]">
                <div className={`w-1.5 h-1.5 rounded-full ${credits > 0 ? "bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.4)]" : "bg-red-400"}`} />
                <span className="tabular-nums font-semibold text-[var(--foreground)]">{credits}</span>
              </div>
            )}
            {user ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  setSession(null);
                  setCredits(null);
                }}
                className="text-[12px] text-white/80 hover:text-white font-medium px-4 py-1.5 rounded-full hover:bg-white/[0.06] transition-colors"
              >
                Sign out
              </motion.button>
            ) : (
              <LiquidButton
                variant="accent"
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="font-semibold text-[12px] rounded-full"
              >
                Sign in
              </LiquidButton>
            )}
          </div>
        </motion.div>
      </header>

      {/* Main */}
      <div className={`flex-1 flex flex-col items-center ${step !== "upload" ? "justify-center" : ""} p-6 relative z-10`}>

        {/* Progress Stepper */}
        {step !== "upload" && (
        <div className="w-full max-w-5xl mb-8">
          <div className="max-w-xs mx-auto flex items-center">
            {PROGRESS_STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500
                      ${i < progressIndex
                        ? "step-completed text-white"
                        : i === progressIndex
                          ? "step-active text-white"
                          : "bg-white/[0.05] text-[var(--muted-foreground)] border border-white/[0.08]"
                      }
                    `}
                  >
                    {i < progressIndex ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <StepIcon icon={s.icon} active={i === progressIndex} />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-medium tracking-wide transition-all duration-500 ${
                      i <= progressIndex ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {i < PROGRESS_STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-white/[0.08] mx-3 mt-[-16px] rounded-full overflow-hidden">
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

        {/* Content */}
        <div className={`w-full max-w-5xl animate-content-enter ${step === "upload" ? "min-h-[calc(100vh-120px)] flex flex-col items-center justify-center relative" : ""}`} key={step}>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-xl glass-card border-red-500/10 text-red-400 text-[13px] flex items-center justify-between animate-fade-up">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
              <button onClick={() => setError("")} className="text-red-400/30 hover:text-red-400 text-[11px] ml-4 transition-colors">
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
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--muted)] hover:text-[var(--muted-foreground)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-bounce">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </>
          )}

          {step === "analyzing" && (
            <LoadingState
              message="Analyzing your video"
              substeps={ANALYZE_SUBSTEPS}
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
              substeps={GENERATE_SUBSTEPS}
              stepDurations={GENERATE_DURATIONS}
              hint="This usually takes 1-2 minutes"
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
            <div className="flex flex-col items-center gap-6">
              <div className="text-center animate-success">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/15 text-emerald-400 text-[11px] font-semibold mb-3">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="check-pop">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Ready to post
                </div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] mb-1">
                  Your video is ready
                </h2>
                {selectedVariation && (
                  <p className="text-[var(--muted-foreground)] text-[13px]">
                    {selectedVariation.style_label} &middot; AI-matched soundtrack
                  </p>
                )}
              </div>

              <div className="relative animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
                <div className="absolute -inset-3 rounded-2xl bg-[var(--accent)]/[0.04] blur-2xl breathe pointer-events-none" />
                <video
                  src={mergedVideoUrl}
                  controls
                  autoPlay
                  className="relative z-10 w-auto max-w-md max-h-[45vh] rounded-xl border border-white/[0.10] shadow-2xl"
                />
              </div>

              <div className="flex items-center gap-2.5 animate-fade-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
                <a
                  href={mergedVideoUrl}
                  download="vibesync_export.mp4"
                  className="btn-primary px-5 py-2.5 hover-lift"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    className="btn-secondary py-2.5 hover-lift"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                    Track only
                  </a>
                )}
              </div>

              <button
                onClick={handleReset}
                className="text-[12px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors animate-fade-up"
                style={{ animationDelay: "0.2s", animationFillMode: "both" }}
              >
                Create another
              </button>
            </div>
          )}
        </div>

        {/* Landing Page Sections */}
        {step === "upload" && (
          <>
            {/* How it works */}
            <section className="w-full max-w-4xl py-28 px-2">
              <div className="text-center mb-14">
                <h2 className="text-2xl font-semibold tracking-[-0.03em] mb-2">Three steps. Zero effort.</h2>
                <p className="text-[var(--muted-foreground)] text-[13px]">From raw footage to finished soundtrack.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Step 1 */}
                <div className="group">
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] flex items-center justify-center relative overflow-hidden mb-4 transition-colors duration-400 group-hover:border-white/[0.12]">
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.06), transparent 70%)' }} />
                    <div className="relative w-12 h-12 rounded-xl bg-[var(--accent)]/[0.10] border border-[var(--accent)]/15 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)]">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[var(--foreground)]/70 bg-white/[0.06] w-5 h-5 rounded-md flex items-center justify-center border border-white/[0.08] tabular-nums">1</span>
                    <h3 className="font-medium text-[13px] tracking-[-0.01em]">Drop your video</h3>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed pl-7">Any clip up to 30 seconds. MP4, MOV, or WebM.</p>
                </div>

                {/* Step 2 */}
                <div className="group">
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] flex items-end justify-center relative overflow-hidden mb-4 px-6 pb-10 transition-colors duration-400 group-hover:border-white/[0.12]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-[var(--accent)]/[0.06] rounded-full blur-3xl" />
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="relative flex-1 mx-[1px] rounded-full bg-[var(--accent)]/20 group-hover:bg-[var(--accent)]/25 transition-colors duration-500" style={{ height: `${Math.round(20 + Math.sin(i * 0.7) * 35 + Math.cos(i * 0.4) * 25)}%` }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[var(--foreground)]/70 bg-white/[0.06] w-5 h-5 rounded-md flex items-center justify-center border border-white/[0.08] tabular-nums">2</span>
                    <h3 className="font-medium text-[13px] tracking-[-0.01em]">AI analyzes everything</h3>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed pl-7">Mood, pacing, energy, scene transitions — detected automatically.</p>
                </div>

                {/* Step 3 */}
                <div className="group">
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] flex items-center justify-center relative overflow-hidden mb-4 transition-colors duration-400 group-hover:border-white/[0.12]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-emerald-500/[0.06] rounded-full blur-3xl" />
                    <div className="relative flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/15 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted-foreground)]">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[var(--foreground)]/70 bg-white/[0.06] w-5 h-5 rounded-md flex items-center justify-center border border-white/[0.08] tabular-nums">3</span>
                    <h3 className="font-medium text-[13px] tracking-[-0.01em]">Pick & download</h3>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed pl-7">3 AI-composed tracks. Smart audio mixing. Export-ready.</p>
                </div>
              </div>
            </section>

            {/* Bottom CTA */}
            <section className="w-full max-w-3xl text-center pb-28 pt-6">
              <p className="text-base font-medium tracking-[-0.02em] mb-5 text-[var(--foreground)]">Ready to try?</p>
              <LiquidButton
                variant="accent"
                size="xl"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="font-semibold text-[13px] tracking-[-0.01em]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload your first video
              </LiquidButton>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-4">5 free credits &middot; No card required</p>
            </section>
          </>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </main>
  );
}
