"use client";

import { getEmotion, EMOTIONS, type EmotionId } from "@/lib/emotions";
import type { EmotionResult } from "@/lib/emotions";

interface EmotionBadgeProps {
  detected: EmotionResult;
  override: string | null;
  onOverride: (emotion: string | null) => void;
}

export function EmotionBadge({ detected, override, onOverride }: EmotionBadgeProps) {
  const activeEmotion = override || detected.emotion;
  const emotionInfo = getEmotion(activeEmotion);
  const confidence = override ? null : Math.round(detected.confidence * 100);
  const isOverridden = override !== null;

  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
          isOverridden
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border bg-muted/50 text-muted-foreground"
        }`}
      >
        <span>{emotionInfo.emoji}</span>
        <span>{emotionInfo.label}</span>
        {confidence !== null && (
          <span className="text-[10px] opacity-60">{confidence}%</span>
        )}
        {isOverridden && (
          <span className="text-[10px] opacity-60">✎</span>
        )}
      </button>

      {/* Dropdown on hover */}
      <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block">
        <div className="bg-card border border-border rounded-lg shadow-xl p-1.5 min-w-[160px]">
          {/* Auto-detect option */}
          <button
            onClick={() => onOverride(null)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors ${
              !isOverridden ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span>🔮</span>
            <span>Auto-detect</span>
          </button>

          <div className="h-px bg-border my-1" />

          {EMOTIONS.map((e) => (
            <button
              key={e.id}
              onClick={() => onOverride(e.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors ${
                override === e.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>{e.emoji}</span>
              <span>{e.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
