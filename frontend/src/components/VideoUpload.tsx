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
    <div className="flex flex-col items-center gap-10 stagger">

      {/* Hero */}
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.045em] leading-[1.05] mb-5">
          <span className="text-[var(--foreground)]">Video in,</span>
          <br />
          <span className="text-gradient-hero">soundtrack out.</span>
        </h1>
        <p className="text-[var(--muted-foreground)] text-[15px] leading-relaxed max-w-md mx-auto tracking-[-0.01em]">
          AI-composed music, perfectly matched to your footage.
        </p>
      </div>

      {/* Upload card */}
      <div className={`gradient-border rounded-2xl w-full max-w-lg ${dragging ? "opacity-100" : ""}`}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            group rounded-2xl cursor-pointer backdrop-blur-2xl
            flex flex-col items-center justify-center gap-5 py-14 px-8
            transition-all duration-400
            ${dragging
              ? "bg-[var(--accent)]/[0.04]"
              : "bg-white/[0.02] hover:bg-white/[0.03]"
            }
          `}
        >
          {/* Icon */}
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-400
            ${dragging
              ? "bg-[var(--accent)]/15 scale-110"
              : "bg-[var(--accent)]/[0.06] group-hover:bg-[var(--accent)]/[0.10] group-hover:scale-105"
            }
          `}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`transition-colors duration-300 ${
                dragging ? "text-[var(--accent)]" : "text-[var(--muted-foreground)] group-hover:text-[var(--accent)]"
              }`}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="font-medium text-[15px] tracking-[-0.01em] mb-1">
              {dragging ? "Release to upload" : "Drop your video here"}
            </p>
            <p className="text-xs text-[var(--muted)]">
              MP4, MOV, WebM &middot; up to {MAX_DURATION_S} seconds
            </p>
          </div>

          {/* Browse button */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-[var(--muted-foreground)] group-hover:border-white/[0.1] group-hover:text-[var(--foreground)] transition-all duration-300">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            Browse files
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
        <p className="text-red-400 text-xs animate-fade-up">{validationError}</p>
      )}

      {/* Free credits — conversion hook */}
      <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/[0.06] border border-emerald-500/[0.10]">
        <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <span className="text-[13px] text-emerald-400 font-medium tracking-[-0.01em]">5 free credits</span>
        <span className="text-[11px] text-[var(--muted-foreground)]">no card required</span>
      </div>

      {/* Value props */}
      <div className="flex items-center gap-2.5 flex-wrap justify-center">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.025] border border-white/[0.05] text-[12px] text-[var(--muted-foreground)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)]/60">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          ~30 seconds
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.025] border border-white/[0.05] text-[12px] text-[var(--muted-foreground)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)]/60">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          3 variations
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.025] border border-white/[0.05] text-[12px] text-[var(--muted-foreground)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)]/60">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          License-free
        </div>
      </div>

      {/* Trust — subtle */}
      <p className="text-[10px] text-[var(--muted)] tracking-wide">
        Powered by Google AI
      </p>
    </div>
  );
}
