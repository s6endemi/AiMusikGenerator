"use client";

import { useState, useRef, useEffect } from "react";
import type { MusicVariation, AudioProfile } from "@/lib/api";

function getStyleIcon(label: string): string {
  return label.charAt(0).toUpperCase();
}

function getStyleDescription(label: string, index: number): string {
  if (label === "Original") return "Faithful to the AI analysis";
  if (index === 1) return "Contrasting alternative direction";
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
        className="self-start text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5 group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-0.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to prompt
      </button>

      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Pick your soundtrack
        </h2>
        <p className="text-[var(--muted)] text-sm">
          3 AI-generated variations &middot; click to preview
        </p>
      </div>

      {/* Variations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
        {variations.map((v, idx) => (
          <button
            key={v.file_id}
            onClick={() => togglePlay(v)}
            className={`
              relative p-5 rounded-xl text-left transition-all duration-300
              ${
                selected === v.file_id
                  ? "glass-card glass-card-selected"
                  : "glass-card glass-card-hover hover:border-white/[0.08]"
              }
            `}
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            {/* Style icon */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  selected === v.file_id
                    ? "bg-gradient-to-br from-[var(--accent)] to-indigo-600 text-white shadow-[0_0_16px_var(--accent-glow)]"
                    : "bg-white/[0.04] text-[var(--muted)]"
                }`}
              >
                {getStyleIcon(v.style_label)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{v.style_label}</p>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  {getStyleDescription(v.style_label, idx)}
                </p>
              </div>
            </div>

            {/* Waveform visualization */}
            <div className="flex items-end gap-[2px] h-10 mt-2 mb-1">
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
                          ? "bg-[var(--accent)]/30"
                          : "bg-white/[0.06]"
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
            <div className="absolute top-4 right-4">
              {playing === v.file_id ? (
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--accent)]">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  selected === v.file_id ? "bg-[var(--accent)]/10" : "bg-white/[0.03]"
                }`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={`transition-colors ${
                    selected === v.file_id ? "text-[var(--accent)]" : "text-[var(--muted)]"
                  }`}>
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Selected indicator */}
            {selected === v.file_id && (
              <div className="absolute -top-px -right-px w-5 h-5 rounded-bl-lg rounded-tr-xl bg-[var(--accent)] flex items-center justify-center check-pop">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Smart Mix Info */}
      <div className="px-4 py-3 rounded-xl glass-card text-xs text-[var(--muted)] flex items-center gap-2.5 max-w-md">
        <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/8 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
            <path d="M12 16v-4m0-4h.01" />
          </svg>
        </div>
        Smart mix: music auto-ducks during speech, stays prominent in quiet moments
      </div>

      {/* Merge CTA */}
      <button
        onClick={handleSelect}
        className="btn-primary px-8 py-3.5 hover-lift"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        Use &ldquo;{variations.find((v) => v.file_id === selected)?.style_label}&rdquo;
      </button>
    </div>
  );
}
