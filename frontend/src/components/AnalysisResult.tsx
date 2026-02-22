"use client";

import { useState } from "react";
import type { VideoAnalysis } from "@/lib/api";

const ENERGY_COLORS: Record<string, string> = {
  calm: "bg-blue-500/15 text-blue-400",
  building: "bg-amber-500/15 text-amber-400",
  intense: "bg-orange-500/15 text-orange-400",
  peak: "bg-red-500/15 text-red-400",
  fading: "bg-purple-500/15 text-purple-400",
};

interface Props {
  analysis: VideoAnalysis;
  videoUrl: string;
  prompt: string;
  negativePrompt: string;
  bpm: number;
  onPromptChange: (v: string) => void;
  onNegativePromptChange: (v: string) => void;
  onBpmChange: (v: number) => void;
  onGenerate: () => void;
  onBack: () => void;
}

export default function AnalysisResult({
  analysis,
  videoUrl,
  prompt,
  negativePrompt,
  bpm,
  onPromptChange,
  onNegativePromptChange,
  onBpmChange,
  onGenerate,
  onBack,
}: Props) {
  const [showReasoning, setShowReasoning] = useState(false);

  const fmt = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-5 stagger">
      <button
        onClick={onBack}
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5 group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-0.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        New video
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Video + context */}
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden">
            <div className="absolute -inset-1 bg-[var(--accent)]/[0.03] blur-xl rounded-xl pointer-events-none" />
            <video
              src={videoUrl}
              controls
              className="relative z-10 w-full rounded-xl border border-[var(--border)] bg-black"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {[analysis.overall_mood, `${analysis.bpm} BPM`, analysis.key].map((tag) => (
              <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[var(--accent)]/8 text-[var(--accent)] border border-[var(--accent)]/10">
                {tag}
              </span>
            ))}
          </div>

          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed pl-0.5">
            {analysis.energy_arc}
          </p>
        </div>

        {/* Right: Editor card */}
        <div className="glass-card rounded-xl flex flex-col">

          {/* Prompt — main area */}
          <div className="p-5 pb-4">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-2">
              Music Prompt
            </label>
            <div className="relative min-h-[160px]" style={{ height: "clamp(160px, 20vh, 240px)" }}>
              <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                className="absolute inset-0 w-full h-full rounded-xl bg-white/[0.02] border border-[var(--border)] p-3.5 text-sm leading-relaxed resize-none focus:outline-none focus:border-[var(--accent)]/40 transition-all placeholder:text-[var(--muted)]"
                placeholder="Describe the music you want..."
              />
            </div>
          </div>

          {/* Controls */}
          <div className="px-5 pb-4 space-y-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-2">
                Avoid
              </label>
              <input
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                className="w-full rounded-lg bg-white/[0.02] border border-[var(--border)] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)]/40 transition-all placeholder:text-[var(--muted)]"
                placeholder="vocals, heavy drums"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">BPM</label>
                <span className="text-xs font-mono font-semibold text-[var(--accent)] tabular-nums">{bpm}</span>
              </div>
              <input
                type="range" min={40} max={220} value={bpm}
                onChange={(e) => onBpmChange(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <button onClick={onGenerate} className="group relative w-full py-3.5 text-sm font-semibold rounded-xl text-white overflow-hidden transition-all duration-300 hover:translate-y-[-1px] active:translate-y-0">
              {/* Gradient bg */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] via-[#7c3aed] to-[#6366f1] transition-opacity" />
              {/* Shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {/* Glow */}
              <div className="absolute inset-0 rounded-xl shadow-[0_0_20px_var(--accent-glow),0_0_60px_var(--accent-glow)] group-hover:shadow-[0_0_28px_var(--accent-glow-strong),0_0_80px_var(--accent-glow)] transition-shadow duration-300" />
              {/* Inner highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              {/* Content */}
              <span className="relative flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                Generate 3 Variations
              </span>
            </button>
          </div>

          {/* Segments + Reasoning — informational zone */}
          <div className="border-t border-white/[0.04] flex-1 min-h-0 overflow-y-auto">
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[var(--accent)]/8 flex items-center justify-center shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold tracking-tight block leading-tight">Timeline Segments</span>
                  <p className="text-[11px] text-[var(--muted)]">AI-detected energy shifts in your video</p>
                </div>
              </div>
            </div>

            <div className="px-5 pb-4 space-y-1.5">
              {analysis.segments?.map((seg, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start rounded-lg px-3 py-2.5 bg-white/[0.015] hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-xs font-mono text-[var(--muted-foreground)] whitespace-nowrap mt-0.5 tabular-nums">
                    {fmt(seg.start_seconds)}-{fmt(seg.end_seconds)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ENERGY_COLORS[seg.energy] || "bg-gray-500/15 text-gray-400"}`}>
                        {seg.energy}
                      </span>
                      <span className="text-xs text-[var(--foreground)]/70">{seg.mood}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{seg.musical_suggestion}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Reasoning — collapsible */}
            {analysis.reasoning && (
              <div className="mx-5 mb-4 border-t border-white/[0.04] pt-3">
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="flex items-center gap-2.5 hover:opacity-80 transition-opacity w-full"
                >
                  <div className="w-6 h-6 rounded-md bg-[var(--accent)]/8 flex items-center justify-center shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)]">
                      <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.4-3 5.7V16a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-1.3C6.3 13.4 5 11.5 5 9a7 7 0 0 1 7-7z" />
                      <path d="M9 21h6" />
                      <path d="M10 17v1" />
                      <path d="M14 17v1" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-[var(--foreground)]">AI Reasoning</span>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-[var(--muted)] ml-auto transition-transform duration-200 ${showReasoning ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {showReasoning && (
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)] mt-2.5 pl-[21px] animate-fade-up">
                    {analysis.reasoning}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
