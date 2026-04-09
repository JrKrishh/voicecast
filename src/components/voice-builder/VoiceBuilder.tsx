"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AgeSlider } from "./AgeSlider";
import { GenderPicker } from "./GenderPicker";
import { ArchetypePicker } from "./ArchetypePicker";
import { PromptPreview } from "./PromptPreview";
import { assemblePromptPreview, type VoiceProfile } from "@/lib/prompt-assembler";
import { getAgeLabel } from "@/lib/age-map";
import { findArchetype } from "@/lib/archetype-map";
import { useSessionStore } from "@/store/session-store";

export function VoiceBuilder() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("female");
  const [age, setAge] = useState(25);
  const [archetypeId, setArchetypeId] = useState("dark_wizard");
  const [customNotes, setCustomNotes] = useState("");

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdVoice, setCreatedVoice] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const setVoiceProfile = useSessionStore((s) => s.setVoiceProfile);

  const profile: VoiceProfile = useMemo(() => ({
    name: name || "Unnamed",
    gender,
    age,
    archetypeId,
    customNotes,
  }), [name, gender, age, archetypeId, customNotes]);

  const assembledPrompt = useMemo(() => assemblePromptPreview(profile), [profile]);

  const handlePreview = async () => {
    setGenerating(true);
    setError(null);
    setPreviewAudio(null);
    setCreatedVoice(null);

    try {
      const archetype = findArchetype(archetypeId);
      const previewText = `I am ${name || "your character"}. Listen to my voice and decide if I match your vision. Every word I speak carries the weight of who I am.`;

      const res = await fetch("/api/voice-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice_prompt: assembledPrompt,
          preview_text: previewText,
          preferred_name: (name || archetype?.name || "character").replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 16),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Failed (${res.status})`);
        return;
      }

      setCreatedVoice(data.voice_id);
      setPreviewAudio(data.preview_audio);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  };

  const handlePlay = () => {
    if (!previewAudio) return;
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
        return;
      }
    }
    const audio = new Audio(`data:audio/mpeg;base64,${previewAudio}`);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.play();
    setPlaying(true);
  };

  const handleSave = () => {
    if (createdVoice) {
      setVoiceProfile(createdVoice, name || "Unnamed Voice", assembledPrompt);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Voice Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Design a unique character voice. Every parameter shapes the final sound.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Voice Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Elder Mage, Captain Rex, Fairy Queen..."
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            />
          </div>

          <Separator />
          <GenderPicker value={gender} onChange={setGender} />
          <Separator />
          <AgeSlider value={age} onChange={setAge} />
          <Separator />
          <ArchetypePicker value={archetypeId} onChange={setArchetypeId} />
          <Separator />

          {/* Custom Notes */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Custom Notes <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g., slight Eastern European accent, speaks in riddles, always sounds amused..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
            />
          </div>

          <Separator />
          <PromptPreview prompt={assembledPrompt} />

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Preview audio player */}
          {previewAudio && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Voice Created</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{createdVoice}</p>
                </div>
                <button
                  onClick={handlePlay}
                  className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  {playing ? (
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-primary ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              size="lg"
              onClick={handlePreview}
              disabled={generating}
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating Voice...
                </span>
              ) : previewAudio ? (
                "🔊 Redesign Voice"
              ) : (
                "🔊 Preview Voice"
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSave}
              disabled={!createdVoice}
            >
              💾 Use in Dialogue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
