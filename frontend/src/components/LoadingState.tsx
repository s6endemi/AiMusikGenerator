interface Props {
  message: string;
  sub?: string;
}

export default function LoadingState({ message, sub }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 py-20 stagger">
      {/* Orbital ring + wave bars */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-[var(--border)] spin-slow" />
        {/* Accent dot on ring */}
        <div className="absolute inset-0 spin-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow-strong)]" />
        </div>
        {/* Inner glow */}
        <div className="absolute inset-4 rounded-full bg-[var(--accent)]/[0.03] breathe" />

        {/* Wave bars center */}
        <div className="relative flex items-end gap-[3px] h-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-[2.5px] rounded-full bg-[var(--accent)] wave-bar"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: "25%",
                opacity: 0.3 + (i / 12) * 0.7,
              }}
            />
          ))}
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-lg font-semibold tracking-tight animate-pulse-glow">
          {message}
        </p>
        {sub && (
          <p className="text-sm text-[var(--muted)] mt-2">{sub}</p>
        )}
      </div>
    </div>
  );
}
