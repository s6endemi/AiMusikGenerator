"use client";

import { useRef, useState, useEffect } from "react";

interface Props {
  audioUrl: string;
  onNewVideo: () => void;
}

export default function AudioPlayer({ audioUrl, onNewVideo }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Derive base URL and file_id from the full audioUrl
  // audioUrl is like: http://localhost:8000/api/music/download/{fileId}/mp3
  const urlParts = audioUrl.split("/");
  const fileId = urlParts[urlParts.length - 2] || "";
  const apiBase = audioUrl.substring(0, audioUrl.indexOf("/api"));

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-1">
          Your soundtrack is ready
        </h2>
        <p className="text-[var(--muted)] text-sm">
          30 seconds of AI-generated music
        </p>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Player Card */}
      <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
        {/* Waveform visualization (static bars) */}
        <div className="flex items-end justify-center gap-[3px] h-20">
          {Array.from({ length: 40 }).map((_, i) => {
            const h =
              20 + Math.sin(i * 0.5) * 30 + Math.cos(i * 0.3) * 20;
            const filled = (i / 40) * 100 <= progress;
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-colors ${
                  filled
                    ? "bg-[var(--accent)]"
                    : "bg-[var(--border)]"
                }`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>

        {/* Progress bar */}
        <div
          onClick={seek}
          className="w-full h-1.5 rounded-full bg-[var(--border)] cursor-pointer"
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--muted)] font-mono">
            {fmt(currentTime)}
          </span>

          <button
            onClick={toggle}
            className="w-12 h-12 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] flex items-center justify-center transition-colors"
          >
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="white"
              >
                <polygon points="6,3 20,12 6,21" />
              </svg>
            )}
          </button>

          <span className="text-xs text-[var(--muted)] font-mono">
            {fmt(duration)}
          </span>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex gap-3">
        <a
          href={`${apiBase}/api/music/download/${fileId}/mp3`}
          download
          className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors"
        >
          Download MP3
        </a>
        <a
          href={`${apiBase}/api/music/download/${fileId}/wav`}
          download
          className="px-6 py-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-sm font-medium transition-colors"
        >
          Download WAV
        </a>
      </div>

      {/* New Video */}
      <button
        onClick={onNewVideo}
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        Create another soundtrack
      </button>
    </div>
  );
}
