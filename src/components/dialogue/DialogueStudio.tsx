"use client";

import { useSessionStore } from "@/store/session-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogueLine } from "./DialogueLine";

export function DialogueStudio() {
  const {
    voiceProfileName,
    lines,
    addLine,
    removeLine,
    updateLineText,
    setEmotionOverride,
    setLineGenerating,
  } = useSessionStore();

  const filledLines = lines.filter((l) => l.text.trim()).length;
  const hasAudio = lines.some((l) => l.audioUrl);

  const handleGenerateLine = (lineId: string) => {
    // Mock generation — in production this calls the inference server
    setLineGenerating(lineId, true);
    setTimeout(() => {
      // Simulate audio generation with a placeholder
      useSessionStore.getState().setLineAudio(
        lineId,
        "", // No real audio yet — will be connected to Qwen3-TTS
        2.5 + Math.random() * 3
      );
    }, 1500 + Math.random() * 1000);
  };

  const handleGenerateAll = () => {
    const filledLinesList = lines.filter((l) => l.text.trim());
    filledLinesList.forEach((line, i) => {
      setTimeout(() => handleGenerateLine(line.id), i * 500);
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dialogue Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Write dialogue lines — emotion is auto-detected and shapes the voice delivery.
          </p>
        </div>
      </div>

      {/* Voice selector */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-lg">
              🎙️
            </div>
            <div>
              <p className="text-sm font-medium">{voiceProfileName}</p>
              <p className="text-[10px] text-muted-foreground">Active voice profile</p>
            </div>
          </div>
          <a href="/studio/voices" className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            Change Voice
          </a>
        </CardContent>
      </Card>

      {/* Dialogue lines */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Dialogue Lines
          </label>
          <span className="text-xs text-muted-foreground">
            {filledLines} / {lines.length} filled
          </span>
        </div>

        {lines.map((line, idx) => (
          <DialogueLine
            key={line.id}
            line={line}
            index={idx}
            canRemove={lines.length > 1}
            onUpdateText={(text) => updateLineText(line.id, text)}
            onOverrideEmotion={(emotion) => setEmotionOverride(line.id, emotion)}
            onRemove={() => removeLine(line.id)}
            onGenerate={() => handleGenerateLine(line.id)}
          />
        ))}

        <button
          onClick={addLine}
          className="w-full py-2.5 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Line
        </button>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          className="flex-1"
          size="lg"
          onClick={handleGenerateAll}
          disabled={filledLines === 0}
        >
          🔊 Generate All Lines
        </Button>
        <Button
          variant="outline"
          size="lg"
          disabled={!hasAudio}
        >
          ⬇ Export ZIP
        </Button>
      </div>

      {/* Emotion legend */}
      <div className="text-[10px] text-muted-foreground space-y-1">
        <p className="font-medium uppercase tracking-widest">How emotion detection works</p>
        <p>As you type, the system analyzes your dialogue text and detects the primary emotion. This emotion is automatically injected into the voice generation prompt, so the AI delivers the line with the right feeling. Hover over the emotion badge to manually override.</p>
      </div>
    </div>
  );
}
