"use client";

interface PromptPreviewProps {
  prompt: string;
}

export function PromptPreview({ prompt }: PromptPreviewProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
        Assembled Voice Description
      </label>
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed font-mono">
          {prompt || "Configure the voice above to see the assembled prompt..."}
        </p>
      </div>
    </div>
  );
}
