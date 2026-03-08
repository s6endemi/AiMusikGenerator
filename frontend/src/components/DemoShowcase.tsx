"use client";

import { useState, useRef, useCallback } from "react";

export default function DemoShowcase() {
  const [active, setActive] = useState<"before" | "after" | null>(null);
  const beforeRef = useRef<HTMLVideoElement>(null);
  const afterRef = useRef<HTMLVideoElement>(null);

  const toggleVideo = useCallback((side: "before" | "after") => {
    setActive((prev) => {
      const next = prev === side ? null : side;
      const before = beforeRef.current;
      const after = afterRef.current;

      if (before) {
        if (next === "before") { before.muted = false; before.play(); }
        else { before.pause(); before.muted = true; }
      }
      if (after) {
        if (next === "after") { after.muted = false; after.play(); }
        else { after.pause(); after.muted = true; }
      }

      return next;
    });
  }, []);

  return (
    <section className="w-full max-w-4xl pt-16 pb-28 px-4">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-16">
        <h2 className="text-xl sm:text-3xl font-semibold tracking-[-0.04em] mb-2.5">
          Same video.{" "}
          <span className="text-gradient-hero">Different feeling.</span>
        </h2>
        <p className="text-[var(--muted-foreground)] text-[12px] sm:text-[13px]">
          Tap to hear what AI-composed music adds to your footage.
        </p>
      </div>

      {/* Before / After — stacked on mobile, side by side on desktop */}
      <div className="flex flex-col sm:flex-row justify-center items-center sm:items-start max-w-2xl mx-auto gap-3 sm:gap-0">

        {/* Before — Original */}
        <div className="w-full max-w-[280px] sm:flex-1 sm:max-w-[260px] flex flex-col items-center gap-2.5">
          <button
            onClick={() => toggleVideo("before")}
            className={`
              group/card relative rounded-2xl overflow-hidden w-full transition-all duration-500 ease-out sm:hover:-translate-y-0.5
              ${active === "before"
                ? "ring-1 ring-white/20 shadow-[0_0_20px_rgba(255,255,255,0.04)]"
                : "border border-white/[0.08] sm:hover:border-white/[0.14]"
              }
            `}
          >
            <div className="aspect-[9/16] relative bg-[#08080a] overflow-hidden">
              <video
                ref={beforeRef}
                src="/demos/before.mp4"
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out sm:group-hover/card:scale-[1.04]"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

              {/* Center play/sound indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`
                    w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${active === "before"
                      ? "bg-white/[0.12] scale-90"
                      : "bg-white/[0.06] backdrop-blur-sm sm:group-hover/card:bg-white/[0.12] sm:group-hover/card:scale-110"
                    }
                  `}
                >
                  {active === "before" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/80">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity="0.15" />
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 sm:group-hover/card:text-white/80 transition-colors duration-300 ml-0.5">
                      <polygon points="6,3 20,12 6,21" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Bottom fade */}
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            </div>
          </button>
          <span className="text-[11px] sm:text-[12px] text-[var(--muted-foreground)] font-medium">
            Original audio
          </span>
        </div>

        {/* Divider — horizontal on mobile, vertical on desktop */}
        <div className="flex sm:flex-col items-center justify-center sm:self-stretch w-full sm:w-auto py-2 sm:py-16 px-0 sm:px-5">
          <div className="h-px sm:h-auto sm:w-px flex-1 bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
          <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--muted)] px-3 sm:px-0 sm:py-3">vs</span>
          <div className="h-px sm:h-auto sm:w-px flex-1 bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* After — AI soundtrack */}
        <div className="w-full max-w-[280px] sm:flex-1 sm:max-w-[260px] flex flex-col items-center gap-2.5">
          <button
            onClick={() => toggleVideo("after")}
            className={`
              group/card relative rounded-2xl overflow-hidden w-full transition-all duration-500 ease-out sm:hover:-translate-y-0.5
              ${active === "after"
                ? "ring-1 ring-[var(--accent)]/30 shadow-[0_0_30px_rgba(139,92,246,0.08)]"
                : "border border-white/[0.08] sm:hover:border-white/[0.14]"
              }
            `}
          >
            <div className="aspect-[9/16] relative bg-[#08080a] overflow-hidden">
              <video
                ref={afterRef}
                src="/demos/after.mp4"
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out sm:group-hover/card:scale-[1.04]"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.03] to-transparent pointer-events-none" />

              {/* Center play/sound indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`
                    w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${active === "after"
                      ? "bg-[var(--accent)]/20 scale-90"
                      : "bg-white/[0.06] backdrop-blur-sm sm:group-hover/card:bg-white/[0.12] sm:group-hover/card:scale-110"
                    }
                  `}
                >
                  {active === "after" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)]">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity="0.15" />
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 sm:group-hover/card:text-white/80 transition-colors duration-300 ml-0.5">
                      <polygon points="6,3 20,12 6,21" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Bottom fade */}
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

              {/* Glass now-playing pill */}
              {active === "after" && (
                <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-3 sm:inset-x-3 pointer-events-none animate-fade-up">
                  <div
                    className="relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-2xl border border-white/[0.12] px-3 py-2 sm:px-4 sm:py-3"
                    style={{
                      background: 'linear-gradient(168deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 20px rgba(139,92,246,0.08)',
                    }}
                  >
                    <div className="absolute top-0 left-3 right-3 sm:left-4 sm:right-4 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Accent dot + equalizer */}
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
                        <div className="flex items-end gap-[2px] h-3">
                          {[0.5, 0.85, 0.6, 1, 0.7].map((h, i) => (
                            <div
                              key={i}
                              className="w-[2px] sm:w-[2.5px] rounded-full bg-[var(--accent)]/70 waveform-playing"
                              style={{ height: `${h * 100}%`, animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Track info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-[11px] font-semibold text-white/90 tracking-[-0.01em] truncate">
                          Sunset Ambient
                        </p>
                        <p className="text-[8px] sm:text-[9px] text-white/40 font-medium">
                          AI-composed by VibeSync
                        </p>
                      </div>

                      {/* Music icon */}
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[var(--accent)]/[0.10] border border-[var(--accent)]/15 flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
                          <path d="M9 18V5l12-2v13" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="16" r="3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </button>
          <span className="text-[11px] sm:text-[12px] text-[var(--foreground)]/70 font-medium">
            AI-generated soundtrack
          </span>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-[12px] sm:text-[13px] text-[var(--muted-foreground)] mt-8 sm:mt-10">
        Tap either video to compare
      </p>
    </section>
  );
}
