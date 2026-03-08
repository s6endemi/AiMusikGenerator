"use client";

import { useState } from "react";
import type { VideoAnalysis } from "@/lib/api";

const ENERGY_COLORS: Record<string, string> = {
  calm: "bg-blue-500/10 text-blue-400",
  building: "bg-amber-500/10 text-amber-400",
  intense: "bg-orange-500/10 text-orange-400",
  peak: "bg-red-500/10 text-red-400",
  fading: "bg-purple-500/10 text-purple-400",
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
        className="text-[12px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5 group"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-0.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        New video
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Video + context */}
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden">
            <video
              src={videoUrl}
              controls
              className="relative z-10 w-full rounded-xl border border-white/[0.06] bg-black/50"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {[analysis.overall_mood, `${analysis.bpm} BPM`, analysis.key].map((tag) => (
              <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-[var(--muted-foreground)] border border-white/[0.04]">
                {tag}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            {analysis.energy_arc}
          </p>
        </div>

        {/* Right: Editor card */}
        <div className="glass-card rounded-xl flex flex-col">
          {/* Prompt */}
          <div className="p-5 pb-4">
            <label className="block text-[10px] font-medium uppercase tracking-widest text-[var(--muted)] mb-2">
              Music Direction
            </label>
            <div className="relative min-h-[160px]" style={{ height: "clamp(160px, 20vh, 240px)" }}>
              <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                className="absolute inset-0 w-full h-full rounded-lg bg-white/[0.02] border border-white/[0.05] p-3.5 text-[13px] leading-relaxed resize-none focus:outline-none focus:border-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)] placeholder:leading-relaxed"
                placeholder={"Describe the soundtrack you want.\n\nMood, instruments, pace, style —\ne.g. \"warm jazz piano, soft brushed drums, cozy evening vibe\""}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="px-5 pb-4 space-y-3">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-[var(--muted)] mb-2">
                Avoid
              </label>
              <input
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                className="w-full rounded-lg bg-white/[0.02] border border-white/[0.05] px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)]"
                placeholder="vocals, heavy drums"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-medium uppercase tracking-widest text-[var(--muted)]">BPM</label>
                <span className="text-[11px] font-mono font-medium text-[var(--muted-foreground)] tabular-nums">{bpm}</span>
              </div>
              <input
                type="range" min={40} max={220} value={bpm}
                onChange={(e) => onBpmChange(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <button onClick={onGenerate} className="group relative w-full py-3 text-[13px] font-semibold rounded-xl text-white overflow-hidden transition-all duration-300 hover-lift active:translate-y-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] via-[#7c3aed] to-[#6366f1]" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="absolute inset-0 rounded-xl shadow-[0_0_16px_var(--accent-glow)] group-hover:shadow-[0_0_24px_var(--accent-glow-strong)] transition-shadow duration-300" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="relative flex items-center justify-center gap-2 tracking-[-0.01em]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                Generate 3 Variations
              </span>
            </button>
          </div>

          {/* Segments + Reasoning */}
          <div className="border-t border-white/[0.04] flex-1 min-h-0 overflow-y-auto">
            <div className="px-5 pt-4 pb-2">
              <span className="text-[13px] font-medium tracking-[-0.01em]">Timeline Segments</span>
              <p className="text-[10px] text-[var(--muted)] mt-0.5">Energy shifts detected in your video</p>
            </div>

            <div className="px-5 pb-4 space-y-1">
              {analysis.segments?.map((seg, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start rounded-lg px-3 py-2 bg-white/[0.015] hover:bg-white/[0.025] transition-colors"
                >
                  <span className="text-[11px] font-mono text-[var(--muted)] whitespace-nowrap mt-0.5 tabular-nums">
                    {fmt(seg.start_seconds)}-{fmt(seg.end_seconds)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ENERGY_COLORS[seg.energy] || "bg-gray-500/10 text-gray-400"}`}>
                        {seg.energy}
                      </span>
                      <span className="text-[11px] text-[var(--muted-foreground)]">{seg.mood}</span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] leading-relaxed">{seg.musical_suggestion}</p>
                  </div>
                </div>
              ))}
            </div>

            {analysis.reasoning && (
              <div className="mx-5 mb-4 border-t border-white/[0.04] pt-3">
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity w-full"
                >
                  <span className="text-[13px] font-medium tracking-[-0.01em]">AI Reasoning</span>
                  <svg
                    width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-[var(--muted)] ml-auto transition-transform duration-300 ${showReasoning ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className={`collapsible-content ${showReasoning ? "open" : ""}`}>
                  <div>
                    <p className="text-[12px] leading-relaxed text-[var(--muted-foreground)] mt-2">
                      {analysis.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
