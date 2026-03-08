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
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="text-xl sm:text-3xl font-semibold tracking-[-0.04em] mb-2.5">
          Same video.{" "}
          <span className="text-gradient-hero">Different feeling.</span>
        </h2>
        <p className="text-[var(--muted-foreground)] text-[12px] sm:text-[13px]">
          Tap to hear what AI-composed music adds to your footage.
        </p>
      </div>

      {/* Unified card — wraps both videos + info */}
      <div className="max-w-[580px] mx-auto">
        <div
          className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-white/[0.08]"
          style={{
            background: 'linear-gradient(168deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Videos row */}
          <div className="flex gap-4 sm:gap-6">
            {/* Before */}
            <button
              onClick={() => toggleVideo("before")}
              className={`
                group/card relative flex-1 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 ease-out
                ${active === "before"
                  ? "ring-1 ring-white/20"
                  : "ring-1 ring-transparent hover:ring-white/[0.10]"
                }
              `}
            >
              <div className="aspect-[9/16] relative bg-[#08080a]">
                <video
                  ref={beforeRef}
                  src="/demos/before.mp4"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${active === "before"
                        ? "bg-white/[0.12] scale-90"
                        : "bg-white/[0.06] backdrop-blur-sm sm:group-hover/card:bg-white/[0.10]"
                      }
                    `}
                  >
                    {active === "before" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/80">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity="0.15" />
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 ml-0.5">
                        <polygon points="6,3 20,12 6,21" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </button>

            {/* After */}
            <button
              onClick={() => toggleVideo("after")}
              className={`
                group/card relative flex-1 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 ease-out
                ${active === "after"
                  ? "ring-1 ring-[var(--accent)]/30 shadow-[0_0_24px_rgba(139,92,246,0.06)]"
                  : "ring-1 ring-transparent hover:ring-white/[0.10]"
                }
              `}
            >
              <div className="aspect-[9/16] relative bg-[#08080a]">
                <video
                  ref={afterRef}
                  src="/demos/after.mp4"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${active === "after"
                        ? "bg-[var(--accent)]/20 scale-90"
                        : "bg-white/[0.06] backdrop-blur-sm sm:group-hover/card:bg-white/[0.10]"
                      }
                    `}
                  >
                    {active === "after" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)]">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity="0.15" />
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 ml-0.5">
                        <polygon points="6,3 20,12 6,21" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </button>
          </div>

          {/* Labels row */}
          <div className="flex gap-6 sm:gap-6 mt-2.5 sm:mt-3">
            <div className="flex-1 text-center">
              <span className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] font-medium">Original audio</span>
            </div>
            <div className="flex-1 text-center">
              <span className="text-[10px] sm:text-[11px] text-[var(--foreground)]/70 font-medium">
                With <span className="text-[var(--accent)]">VibeSync</span>
              </span>
            </div>
          </div>

          {/* Now-playing bar — appears when After is active */}
          <div className="min-h-[40px] sm:min-h-[44px] flex items-center justify-center mt-2 sm:mt-3">
            {active === "after" ? (
              <div className="flex flex-col items-center gap-1 animate-fade-up">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
                  <div className="flex items-end gap-[2px] h-3">
                    {[0.5, 0.85, 0.6, 1, 0.7].map((h, i) => (
                      <div
                        key={i}
                        className="w-[2px] rounded-full bg-[var(--accent)]/70 waveform-playing"
                        style={{ height: `${h * 100}%`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] sm:text-[12px] font-semibold text-white/90 tracking-[-0.01em]">Sunset Ambient</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-white/35 font-medium">AI-composed by VibeSync</span>
              </div>
            ) : (
              <p className="text-[11px] sm:text-[12px] text-[var(--muted)]">
                Tap to compare
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
