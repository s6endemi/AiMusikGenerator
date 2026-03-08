"use client";

import { useState } from "react";
import type { VideoAnalysis } from "@/lib/api";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

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
    <div className="space-y-4 stagger">
      <button
        onClick={onBack}
        className="text-[12px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5 group"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-0.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        New video
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Video + meta */}
        <div className="space-y-3">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-xl border border-white/[0.10] bg-black/40"
          />

          <div className="flex items-center gap-2 flex-wrap">
            {[analysis.overall_mood, `${analysis.bpm} BPM`, analysis.key].map((tag) => (
              <span key={tag} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white/[0.07] text-[var(--foreground)]/80 border border-white/[0.10] backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Editor card */}
        <div className="glass-card rounded-xl flex flex-col">
          {/* Prompt */}
          <div className="p-5 pb-4">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">
              Music Direction
            </label>
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              rows={5}
              className="w-full rounded-lg bg-white/[0.04] border border-white/[0.10] p-3.5 text-[13px] leading-relaxed resize-none focus:outline-none focus:border-[var(--accent)]/40 transition-all placeholder:text-[var(--muted)]"
              placeholder={"Mood, instruments, pace, style\u2026\ne.g. \"warm jazz piano, soft brushed drums\""}
            />
          </div>

          {/* Controls */}
          <div className="px-5 pb-5 space-y-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">
                Avoid
              </label>
              <input
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.10] px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[var(--accent)]/40 transition-all placeholder:text-[var(--muted)]"
                placeholder="vocals, heavy drums"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">BPM</label>
                <span className="text-[11px] font-mono font-medium text-[var(--foreground)] tabular-nums">{bpm}</span>
              </div>
              <input
                type="range" min={40} max={220} value={bpm}
                onChange={(e) => onBpmChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <LiquidButton
              variant="accent"
              size="lg"
              onClick={onGenerate}
              className="w-full font-semibold text-[13px] tracking-[-0.01em]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              Generate 3 Variations
            </LiquidButton>
          </div>

          {/* Timeline Segments — collapsed section */}
          {analysis.segments && analysis.segments.length > 0 && (
            <div className="border-t border-white/[0.06] px-5 py-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Timeline</p>
              <div className="space-y-1">
                {analysis.segments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <span className="text-[10px] font-mono text-[var(--muted)] tabular-nums shrink-0">
                      {fmt(seg.start_seconds)}-{fmt(seg.end_seconds)}
                    </span>
                    <span className={`text-[9px] px-1.5 py-px rounded font-semibold uppercase tracking-wide ${ENERGY_COLORS[seg.energy] || "bg-gray-500/10 text-gray-400"}`}>
                      {seg.energy}
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)] truncate">{seg.mood}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          {analysis.reasoning && (
            <div className="border-t border-white/[0.06] px-5 py-4">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center gap-2.5 w-full group"
              >
                <div className="w-5 h-5 rounded-md bg-[var(--accent)]/[0.08] flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4m0-4h.01" />
                  </svg>
                </div>
                <span className="text-[12px] font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">Why this direction?</span>
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`text-[var(--muted)] ml-auto transition-transform duration-300 ${showReasoning ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className={`collapsible-content ${showReasoning ? "open" : ""}`}>
                <div>
                  <p className="text-[12px] leading-relaxed text-[var(--muted-foreground)] mt-3 pl-[30px]">
                    {analysis.reasoning}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
