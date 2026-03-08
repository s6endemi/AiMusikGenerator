"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  message: string;
  sub?: string;
  substeps?: string[];
  stepDurations?: number[];
  hint?: string;
}

export default function LoadingState({ message, sub, substeps, stepDurations, hint }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const startTimeRef = useRef(Date.now());

  const calcIndex = useCallback(() => {
    if (!substeps?.length) return 0;
    const elapsed = Date.now() - startTimeRef.current;
    const defaults = 2200;
    let cumulative = 0;
    for (let i = 0; i < substeps.length - 1; i++) {
      cumulative += stepDurations?.[i] ?? defaults;
      if (elapsed < cumulative) return i;
    }
    return substeps.length - 1;
  }, [substeps, stepDurations]);

  useEffect(() => {
    if (!substeps?.length) return;
    startTimeRef.current = Date.now();
    setActiveIndex(0);

    const interval = setInterval(() => {
      setActiveIndex(calcIndex());
    }, 500);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setActiveIndex(calcIndex());
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [substeps, stepDurations, calcIndex]);

  const totalSteps = substeps?.length ?? 0;

  return (
    <div className="relative flex flex-col items-center gap-10 py-16 stagger">
      {/* Subtle frosted backdrop — separates from shader */}
      <div className="absolute inset-0 -inset-y-4 sm:-inset-x-12 sm:-inset-y-6 rounded-2xl sm:rounded-3xl bg-white/[0.03] backdrop-blur-xl pointer-events-none" />
      {/* Orbital animation — 120px visual area */}
      <div className="relative w-[120px] h-[120px] flex items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full border border-white/[0.06] spin-slow" />
        <div className="absolute -inset-3 rounded-full bg-[var(--accent)]/[0.03] blur-xl breathe" />
        {/* Orbiting dot — counter-rotates */}
        <div className="absolute inset-0 spin-slow" style={{ animationDirection: "reverse" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow-strong)]" />
        </div>
        {/* Inner glow disc */}
        <div className="absolute inset-6 rounded-full bg-[var(--accent)]/[0.04] breathe" />

        {/* Center wave bars */}
        <div className="relative flex items-end gap-[3px] h-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-[2.5px] rounded-full bg-[var(--accent)] wave-bar"
              style={{
                animationDelay: `${i * 0.10}s`,
                height: "25%",
                opacity: 0.25 + (i / 9) * 0.75,
              }}
            />
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="text-center">
        <p className="text-xl font-semibold tracking-[-0.03em]">{message}</p>
        {sub && (!substeps || substeps.length === 0) && (
          <p className="text-sm text-[var(--muted-foreground)] mt-2">{sub}</p>
        )}
        {totalSteps > 0 && (
          <p className="text-[11px] text-[var(--muted)] mt-1.5 tabular-nums font-medium tracking-wide">
            Step {Math.min(activeIndex + 1, totalSteps)} of {totalSteps}
          </p>
        )}
      </div>

      {/* Substeps */}
      {substeps && substeps.length > 0 && (
        <div className="flex flex-col items-center gap-6">
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
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/12 flex items-center justify-center check-pop">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-400">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)] active-dot shadow-[0_0_8px_var(--accent-glow-strong)]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/[0.10]" />
                    )}
                  </div>

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
            <p className="text-sm text-[var(--muted-foreground)]">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
}
