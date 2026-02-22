"use client";

import { useState, useRef, useCallback } from "react";

const MAX_SIZE_MB = 50;
const MAX_DURATION_S = 30;
const ALLOWED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
];

interface Props {
  onUpload: (file: File) => void;
}

export default function VideoUpload({ onUpload }: Props) {
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Unsupported format. Use MP4, MOV, WebM, or AVI.";
    }
    if (file.size / (1024 * 1024) > MAX_SIZE_MB) {
      return `File too large. Maximum is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  }, []);

  const checkDuration = useCallback(
    (file: File) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > MAX_DURATION_S) {
          setValidationError(
            `Video is ${Math.round(video.duration)}s. Maximum is ${MAX_DURATION_S}s.`
          );
        } else {
          onUpload(file);
        }
      };
      video.src = URL.createObjectURL(file);
    },
    [onUpload]
  );

  const handleFile = useCallback(
    (file: File) => {
      setValidationError("");
      const err = validate(file);
      if (err) {
        setValidationError(err);
        return;
      }
      checkDuration(file);
    },
    [validate, checkDuration]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col items-center gap-7 stagger">
      {/* Top badge */}
      <div className="feature-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        Powered by Google AI
      </div>

      {/* Hero text */}
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gradient-hero leading-[1.1] mb-5">
          Video in, soundtrack out
        </h1>
        <p className="text-[var(--muted-foreground)] text-lg leading-relaxed max-w-lg mx-auto">
          Upload a video. AI analyzes the mood, pace, and energy — then
          composes a matching soundtrack in seconds.
        </p>
      </div>

      {/* Feature pills — benefit-focused */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="feature-chip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-400">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          30s generation
        </div>
        <div className="feature-chip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          3 styles to pick
        </div>
        <div className="feature-chip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Licensed &amp; ready
        </div>
      </div>

      {/* Upload zone */}
      <div className={`gradient-border rounded-2xl w-full max-w-xl ${dragging ? "opacity-100" : ""}`}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            group w-full aspect-[16/8] rounded-2xl cursor-pointer
            flex flex-col items-center justify-center gap-5 transition-all duration-300
            ${
              dragging
                ? "bg-[var(--accent)]/[0.06] scale-[1.01]"
                : "bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
            }
          `}
        >
          {/* Icon */}
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500
            ${dragging
              ? "bg-[var(--accent)]/20 scale-110 rotate-[-3deg]"
              : "bg-[var(--accent)]/[0.06] group-hover:bg-[var(--accent)]/[0.1] group-hover:scale-105"
            }
          `}>
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`transition-colors duration-300 ${dragging ? "text-[var(--accent)]" : "text-[var(--muted-foreground)] group-hover:text-[var(--accent)]"}`}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <div className="text-center">
            <p className="font-medium text-sm mb-1">
              {dragging ? "Release to upload" : "Drop your video here"}
            </p>
            <p className="text-xs text-[var(--muted)]">
              or click to browse &middot; MP4, MOV, WebM &middot; max {MAX_DURATION_S}s
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-red-400 text-sm animate-fade-up">{validationError}</p>
      )}

      {/* Trust line */}
      <p className="text-[11px] text-[var(--muted)] tracking-wide">
        3 free credits to start &middot; No account required
      </p>
    </div>
  );
}
