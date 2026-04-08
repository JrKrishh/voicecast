"use client";

import { useState, useRef, useCallback } from "react";

interface AudioPlayerProps {
  audioUrl: string | null;
  duration: number | null;
  isGenerating: boolean;
  onRegenerate: () => void;
  onDownload: () => void;
}

export function AudioPlayer({ audioUrl, duration, isGenerating, onRegenerate, onDownload }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = useCallback(() => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.addEventListener("ended", () => { setPlaying(false); setProgress(0); });
      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime / (audioRef.current.duration || 1));
        }
      });
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }, [audioUrl, playing]);

  if (isGenerating) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground">Generating...</span>
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="text-xs text-muted-foreground italic">No audio yet — generate to hear this line</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-colors shrink-0"
      >
        {playing ? (
          <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-primary ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Progress bar */}
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Duration */}
      {duration && (
        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
          {duration.toFixed(1)}s
        </span>
      )}

      {/* Regenerate */}
      <button
        onClick={onRegenerate}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Regenerate"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* Download */}
      <button
        onClick={onDownload}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Download"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
    </div>
  );
}
