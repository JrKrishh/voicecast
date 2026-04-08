"use client";

import { EmotionBadge } from "./EmotionBadge";
import { AudioPlayer } from "./AudioPlayer";
import type { DialogueLine as DialogueLineType } from "@/store/session-store";

interface DialogueLineProps {
  line: DialogueLineType;
  index: number;
  canRemove: boolean;
  onUpdateText: (text: string) => void;
  onOverrideEmotion: (emotion: string | null) => void;
  onRemove: () => void;
  onGenerate: () => void;
}

export function DialogueLine({
  line,
  index,
  canRemove,
  onUpdateText,
  onOverrideEmotion,
  onRemove,
  onGenerate,
}: DialogueLineProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* Header: line number + emotion badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">Line {index + 1}</span>
        <div className="flex items-center gap-2">
          <EmotionBadge
            detected={line.detectedEmotion}
            override={line.emotionOverride}
            onOverride={onOverrideEmotion}
          />
          {canRemove && (
            <button
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Remove line"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Text input */}
      <textarea
        value={line.text}
        onChange={(e) => onUpdateText(e.target.value)}
        placeholder="Type a dialogue line... (emotion is auto-detected as you type)"
        rows={2}
        className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
      />

      {/* Secondary emotion hint */}
      {line.detectedEmotion.secondary && !line.emotionOverride && line.text.trim() && (
        <p className="text-[10px] text-muted-foreground">
          Also detected: {line.detectedEmotion.secondary} ({Math.round((line.detectedEmotion.secondaryConfidence || 0) * 100)}%)
        </p>
      )}

      {/* Audio player */}
      <AudioPlayer
        audioUrl={line.audioUrl}
        duration={line.durationSeconds}
        isGenerating={line.isGenerating}
        onRegenerate={onGenerate}
        onDownload={() => {
          if (line.audioUrl) {
            const a = document.createElement("a");
            a.href = line.audioUrl;
            a.download = `line_${index + 1}.wav`;
            a.click();
          }
        }}
      />
    </div>
  );
}
