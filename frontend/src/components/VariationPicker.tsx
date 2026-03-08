"use client";

import { useState, useRef, useEffect } from "react";
import type { MusicVariation, AudioProfile } from "@/lib/api";

function getStyleDescription(label: string, index: number): string {
  if (label === "Original") return "Faithful to the AI analysis";
  if (index === 1) return "Contrasting alternative";
  return "A different creative take";
}

interface Props {
  variations: MusicVariation[];
  videoUrl: string;
  audioProfile?: AudioProfile;
  onPick: (variation: MusicVariation) => void;
  onBack: () => void;
}

export default function VariationPicker({
  variations,
  videoUrl,
  audioProfile,
  onPick,
  onBack,
}: Props) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(
    variations[0]?.file_id || ""
  );
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const togglePlay = (variation: MusicVariation) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing === variation.file_id) {
      audio.pause();
      setPlaying(null);
    } else {
      audio.src = variation.audio_url;
      audio.play();
      setPlaying(variation.file_id);
      setSelected(variation.file_id);
    }
  };

  const handleSelect = () => {
    const v = variations.find((v) => v.file_id === selected);
    if (v) onPick(v);
  };

  return (
    <div className="flex flex-col items-center gap-6 stagger">
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(null)}
        preload="none"
      />

      <button
        onClick={onBack}
        className="self-start text-[12px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5 group"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-0.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to prompt
      </button>

      <div className="text-center">
        <h2 className="text-xl font-semibold tracking-[-0.03em] mb-1.5">
          Pick your soundtrack
        </h2>
        <p className="text-[var(--muted)] text-[12px]">
          3 AI-generated variations &middot; click to preview
        </p>
      </div>

      {/* Variations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full max-w-3xl">
        {variations.map((v, idx) => (
          <button
            key={v.file_id}
            onClick={() => togglePlay(v)}
            className={`
              relative p-4 rounded-xl text-left transition-all duration-300
              ${
                selected === v.file_id
                  ? "glass-card glass-card-selected"
                  : "glass-card glass-card-hover"
              }
            `}
            style={{ animationDelay: `${idx * 0.06}s` }}
          >
            {/* Style label */}
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all duration-300 ${
                  selected === v.file_id
                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "bg-white/[0.03] text-[var(--muted)]"
                }`}
              >
                {v.style_label.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[13px] tracking-[-0.01em]">{v.style_label}</p>
                <p className="text-[10px] text-[var(--muted)]">
                  {getStyleDescription(v.style_label, idx)}
                </p>
              </div>
            </div>

            {/* Waveform */}
            <div className="flex items-end gap-[2px] h-9 mb-1">
              {Array.from({ length: 28 }).map((_, barIdx) => {
                const h = 20 + Math.sin(barIdx * 0.6 + idx * 2.5) * 30 + Math.cos(barIdx * 0.35 + idx) * 20;
                const isPlaying = playing === v.file_id;
                const isSelected = selected === v.file_id;
                return (
                  <div
                    key={barIdx}
                    className={`flex-1 min-w-0 rounded-full transition-all duration-300 ${
                      isPlaying
                        ? "bg-[var(--accent)] waveform-playing"
                        : isSelected
                          ? "bg-[var(--accent)]/25"
                          : "bg-white/[0.05]"
                    }`}
                    style={{
                      height: `${h}%`,
                      animationDelay: isPlaying ? `${barIdx * 0.04}s` : undefined,
                    }}
                  />
                );
              })}
            </div>

            {/* Play indicator */}
            <div className="absolute top-3.5 right-3.5">
              {playing === v.file_id ? (
                <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--accent)]">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                </div>
              ) : (
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  selected === v.file_id ? "bg-[var(--accent)]/8" : "bg-white/[0.02]"
                }`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={`transition-colors ${
                    selected === v.file_id ? "text-[var(--accent)]" : "text-[var(--muted)]"
                  }`}>
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Selected check */}
            {selected === v.file_id && (
              <div className="absolute -top-px -right-px w-4.5 h-4.5 rounded-bl-lg rounded-tr-xl bg-[var(--accent)] flex items-center justify-center check-pop">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Smart Mix Info */}
      <div className="px-3.5 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-[var(--muted)] flex items-center gap-2 max-w-md">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted-foreground)] shrink-0">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4m0-4h.01" />
        </svg>
        Music auto-ducks during speech, stays present in quiet moments
      </div>

      {/* Merge CTA */}
      <button
        onClick={handleSelect}
        className="btn-primary px-7 py-3 hover-lift"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        Use &ldquo;{variations.find((v) => v.file_id === selected)?.style_label}&rdquo;
      </button>
    </div>
  );
}
