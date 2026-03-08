"use client";

import { useState, useEffect } from "react";

interface Props {
  message: string;
  sub?: string;
  substeps?: string[];
  stepDurations?: number[];
  hint?: string;
}

export default function LoadingState({ message, sub, substeps, stepDurations, hint }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!substeps?.length) return;
    setActiveIndex(0);

    const defaults = 2200;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    for (let i = 0; i < substeps.length - 1; i++) {
      cumulative += stepDurations?.[i] ?? defaults;
      timers.push(setTimeout(() => setActiveIndex(i + 1), cumulative));
    }

    return () => timers.forEach(clearTimeout);
  }, [substeps, stepDurations]);

  return (
    <div className="flex flex-col items-center gap-8 py-16 stagger">
      {/* Orbital animation */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-white/[0.05] spin-slow" />
        <div className="absolute inset-0 spin-slow" style={{ animationDirection: "reverse" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow-strong)]" />
        </div>
        <div className="absolute inset-3 rounded-full bg-[var(--accent)]/[0.03] breathe" />

        <div className="relative flex items-end gap-[2.5px] h-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-[2px] rounded-full bg-[var(--accent)] wave-bar"
              style={{
                animationDelay: `${i * 0.12}s`,
                height: "30%",
                opacity: 0.3 + (i / 7) * 0.7,
              }}
            />
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="text-center">
        <p className="text-base font-medium tracking-[-0.02em]">{message}</p>
        {sub && (!substeps || substeps.length === 0) && (
          <p className="text-[12px] text-[var(--muted)] mt-1.5">{sub}</p>
        )}
      </div>

      {/* Substeps */}
      {substeps && substeps.length > 0 && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
            {substeps.map((label, i) => {
              const isDone = i < activeIndex;
              const isActive = i === activeIndex;

              return (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 transition-all duration-500 ${
                    i > activeIndex ? "opacity-[0.2]" : "opacity-100"
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {isDone ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center check-pop">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-400">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] active-dot shadow-[0_0_6px_var(--accent-glow)]" />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-white/[0.12]" />
                    )}
                  </div>

                  <span
                    className={`text-[12px] transition-colors duration-500 ${
                      isDone
                        ? "text-[var(--muted-foreground)]"
                        : isActive
                          ? "text-[var(--foreground)] font-medium"
                          : "text-[var(--muted)]"
                    }`}
                  >
                    {label}
                    {isActive && (
                      <span className="inline-flex ml-0.5">
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>.</span>
                        <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>.</span>
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          {hint && (
            <p className="text-[10px] text-[var(--muted)] tracking-wide">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
}
