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
    <div className="flex flex-col items-center gap-10 py-16 stagger">
      {/* Orbital animation */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-white/[0.06] spin-slow" />
        {/* Accent dot on ring */}
        <div className="absolute inset-0 spin-slow" style={{ animationDirection: "reverse" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow-strong)]" />
        </div>
        {/* Inner glow */}
        <div className="absolute inset-3 rounded-full bg-[var(--accent)]/[0.04] breathe" />

        {/* Wave bars center */}
        <div className="relative flex items-end gap-[3px] h-7">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-[2.5px] rounded-full bg-[var(--accent)] wave-bar"
              style={{
                animationDelay: `${i * 0.12}s`,
                height: "30%",
                opacity: 0.4 + (i / 8) * 0.6,
              }}
            />
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="text-center">
        <p className="text-lg font-semibold tracking-tight">{message}</p>
        {sub && (!substeps || substeps.length === 0) && (
          <p className="text-sm text-[var(--muted)] mt-2">{sub}</p>
        )}
      </div>

      {/* Substeps */}
      {substeps && substeps.length > 0 && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col gap-3 w-full max-w-[280px]">
            {substeps.map((label, i) => {
              const isDone = i < activeIndex;
              const isActive = i === activeIndex;

              return (
                <div
                  key={label}
                  className={`flex items-center gap-3 transition-all duration-500 ${
                    i > activeIndex ? "opacity-[0.25]" : "opacity-100"
                  }`}
                >
                  {/* Status indicator */}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center check-pop">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-emerald-400"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)] active-dot shadow-[0_0_8px_var(--accent-glow)]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/[0.15]" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[13px] transition-colors duration-500 ${
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
            <p className="text-[11px] text-[var(--muted)] tracking-wide">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
}
