"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/lib/api";

type Tier = "starter" | "popular" | "pro";

interface PricingModalProps {
  onClose: () => void;
  token: string;
  credits?: number | null;
}

const TIERS: {
  id: Tier;
  credits: number;
  whole: string;
  decimal: string;
  perCredit: string;
  save?: string;
  cta: string;
}[] = [
  {
    id: "starter",
    credits: 5,
    whole: "0",
    decimal: ".99",
    perCredit: "$0.20",
    cta: "Get started",
  },
  {
    id: "popular",
    credits: 20,
    whole: "2",
    decimal: ".99",
    perCredit: "$0.15",
    save: "25%",
    cta: "Most picked",
  },
  {
    id: "pro",
    credits: 100,
    whole: "9",
    decimal: ".99",
    perCredit: "$0.10",
    save: "50%",
    cta: "Best value",
  },
];

export default function PricingModal({ onClose, token, credits }: PricingModalProps) {
  const [loading, setLoading] = useState<Tier | null>(null);

  const handlePurchase = async (tier: Tier) => {
    setLoading(tier);
    try {
      const url = await createCheckoutSession(token, tier);
      window.location.href = url;
    } catch {
      setLoading(null);
    }
  };

  const outOfCredits = credits !== null && credits !== undefined && credits <= 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full sm:max-w-[540px] rounded-t-2xl sm:rounded-2xl animate-fade-up overflow-hidden"
        style={{
          background: "linear-gradient(168deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(40px) saturate(1.3)",
          WebkitBackdropFilter: "blur(40px) saturate(1.3)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: [
            "0 -8px 60px rgba(0,0,0,0.4)",
            "0 24px 80px rgba(0,0,0,0.5)",
            "inset 0 1px 0 rgba(255,255,255,0.08)",
            "inset 0 -1px 0 rgba(0,0,0,0.15)",
          ].join(", "),
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <div className="sm:hidden w-8 h-1 rounded-full bg-white/[0.15] mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div />
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-7 pb-6 pt-2">
          {/* Header */}
          <div className="text-center mb-7">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-white mb-1">
              {outOfCredits ? "You\u2019ve used your free credits" : "Keep creating"}
            </h2>
            <p className="text-[12px] text-white/45 leading-relaxed">
              1 credit = <span className="text-white/65">3 AI soundtracks</span>, mixed and ready to post
            </p>
          </div>

          {/* Tier cards — grid on desktop, stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 sm:items-end">
            {TIERS.map((tier, i) => {
              const isPopular = tier.id === "popular";
              const isLoading = loading === tier.id;

              /* Shared card glass style */
              const cardStyle = isPopular ? {
                background: "linear-gradient(168deg, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.04) 100%)",
                border: "1px solid rgba(139,92,246,0.22)",
                boxShadow: "0 4px 24px rgba(139,92,246,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
              } : {
                background: "linear-gradient(168deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              };

              return (
                <div
                  key={tier.id}
                  className={`relative rounded-xl transition-all duration-200 ${
                    isPopular ? "sm:scale-[1.04] sm:z-10" : "hover:brightness-110"
                  }`}
                  style={cardStyle}
                >
                  {/* Save badge — desktop only */}
                  {tier.save && (
                    <div className={`
                      absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide whitespace-nowrap
                      hidden sm:block
                      ${isPopular ? "bg-[var(--accent)] text-white shadow-[0_2px_8px_rgba(139,92,246,0.3)]" : "bg-white/[0.08] text-white/45"}
                    `}>
                      Save {tier.save}
                    </div>
                  )}

                  {/* ── Mobile layout ── */}
                  <button
                    onClick={() => handlePurchase(tier.id)}
                    disabled={loading !== null}
                    className="sm:hidden w-full flex items-center gap-4 px-4 py-3.5 text-left disabled:opacity-40 group cursor-pointer"
                  >
                    {/* Credit badge */}
                    <div className={`
                      w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                      ${isPopular ? "bg-[var(--accent)]/15" : "bg-white/[0.04]"}
                    `}>
                      <span className={`tabular-nums font-bold text-[18px] tracking-[-0.03em] ${
                        isPopular ? "text-[var(--accent)]" : "text-white/80"
                      }`}>
                        {tier.credits}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white tracking-[-0.01em]">{tier.credits} credits</span>
                        {tier.save && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                            isPopular ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-white/[0.06] text-white/35"
                          }`}>
                            -{tier.save}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-white/30">{tier.perCredit}/credit</span>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <div className="tabular-nums tracking-[-0.03em]">
                        <span className="text-[11px] text-white/50 font-medium align-top leading-none">$</span>
                        <span className="text-[17px] font-bold text-white leading-none">{tier.whole}</span>
                        <span className="text-[12px] text-white/50 font-semibold leading-none">{tier.decimal}</span>
                      </div>
                      <div className={`text-[10px] font-medium mt-0.5 ${isPopular ? "text-[var(--accent)]" : "text-white/25"}`}>
                        {isLoading ? (
                          <svg className="animate-spin inline" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                        ) : tier.cta}
                      </div>
                    </div>

                    {isPopular && (
                      <div className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-full bg-[var(--accent)]" />
                    )}
                  </button>

                  {/* ── Desktop layout ── */}
                  <div className={`hidden sm:flex flex-col items-center text-center ${isPopular ? "p-5 pt-6 pb-5" : "p-5 pt-5"}`}>
                    {/* Credits — the big value number */}
                    <p className={`tabular-nums font-bold tracking-[-0.05em] leading-none mb-0.5 ${
                      isPopular ? "text-[34px] text-white" : "text-[28px] text-white/90"
                    }`}>
                      {tier.credits}
                    </p>
                    <p className={`text-[11px] mb-5 ${isPopular ? "text-white/50" : "text-white/35"}`}>
                      credits
                    </p>

                    {/* Price — split typography: $small + whole big + decimal small */}
                    <div className="tabular-nums tracking-[-0.03em] mb-0.5">
                      <span className={`font-medium align-top leading-none ${
                        isPopular ? "text-[12px] text-white/60" : "text-[11px] text-white/40"
                      }`}>$</span>
                      <span className={`font-bold text-white leading-none ${
                        isPopular ? "text-[24px]" : "text-[20px]"
                      }`}>{tier.whole}</span>
                      <span className={`font-semibold leading-none ${
                        isPopular ? "text-[13px] text-white/55" : "text-[12px] text-white/40"
                      }`}>{tier.decimal}</span>
                    </div>
                    <p className={`text-[10px] mb-5 ${isPopular ? "text-white/35" : "text-white/25"}`}>
                      {tier.perCredit}/credit
                    </p>

                    {/* CTA */}
                    <button
                      onClick={() => handlePurchase(tier.id)}
                      disabled={loading !== null}
                      className={`
                        w-full py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-200 disabled:opacity-40 cursor-pointer
                        ${isPopular
                          ? "bg-[var(--accent)] text-white hover:brightness-110 shadow-[0_2px_16px_rgba(139,92,246,0.3)]"
                          : "bg-white/[0.06] text-white/70 border border-white/[0.08] hover:bg-white/[0.10] hover:text-white"
                        }
                      `}
                    >
                      {isLoading ? (
                        <svg className="animate-spin inline" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                      ) : tier.cta}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indie dev note */}
          <div className="mt-6 pt-5 border-t border-white/[0.05]">
            <p className="text-[11.5px] leading-[1.8] text-center max-w-[360px] mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
              <span className="text-white/80 font-medium not-italic">&ldquo;</span>
              <span className="italic">I&rsquo;m building VibeSync solo. Each generation costs me in
              AI&nbsp;compute&nbsp;&mdash; I kept pricing as low as possible so creators can
              actually use this.</span>
              <span className="text-white/80 font-medium not-italic">&rdquo;</span>
            </p>
          </div>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-2.5 mt-4 flex-wrap">
            <span className="text-[10px] text-white/25 flex items-center gap-1">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Stripe
            </span>
            <span className="text-white/[0.08]">&middot;</span>
            <span className="text-[10px] text-white/25">No subscription</span>
            <span className="text-white/[0.08]">&middot;</span>
            <span className="text-[10px] text-white/25">Never expires</span>
          </div>
        </div>
      </div>
    </div>
  );
}
