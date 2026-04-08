"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AgeSlider } from "./AgeSlider";
import { GenderPicker } from "./GenderPicker";
import { ArchetypePicker } from "./ArchetypePicker";
import { PromptPreview } from "./PromptPreview";
import { assemblePromptPreview, type VoiceProfile } from "@/lib/prompt-assembler";

export function VoiceBuilder() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("female");
  const [age, setAge] = useState(25);
  const [archetypeId, setArchetypeId] = useState("dark_wizard");
  const [customNotes, setCustomNotes] = useState("");

  const profile: VoiceProfile = useMemo(() => ({
    name: name || "Unnamed",
    gender,
    age,
    archetypeId,
    customNotes,
  }), [name, gender, age, archetypeId, customNotes]);

  const assembledPrompt = useMemo(() => assemblePromptPreview(profile), [profile]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
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
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Voice Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Elder Mage, Captain Rex, Fairy Queen..."
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            />
          </div>

          <Separator />

          {/* Gender */}
          <GenderPicker value={gender} onChange={setGender} />

          <Separator />

          {/* Age */}
          <AgeSlider value={age} onChange={setAge} />

          <Separator />

          {/* Archetype */}
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

          {/* Assembled Prompt */}
          <PromptPreview prompt={assembledPrompt} />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" size="lg">
              🔊 Preview Voice
            </Button>
            <Button variant="outline" size="lg">
              💾 Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
