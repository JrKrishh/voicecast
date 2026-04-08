/**
 * Prompt Assembler
 * Combines the 3 layers (Identity + Archetype + Emotion) into a single
 * Qwen3-TTS instruct prompt.
 */

import { getAgeDescriptor } from "./age-map";
import { findArchetype } from "./archetype-map";

export interface GenderOption {
  id: string;
  label: string;
  descriptor: string;
}

export const GENDER_OPTIONS: GenderOption[] = [
  { id: "male", label: "Male", descriptor: "male voice, chest resonance" },
  { id: "female", label: "Female", descriptor: "female voice, natural clarity" },
  { id: "neutral", label: "Neutral", descriptor: "androgynous voice, no strong gender markers" },
  { id: "boy", label: "Boy (child)", descriptor: "young male voice, pre-pubescent" },
  { id: "girl", label: "Girl (child)", descriptor: "young female voice, light and bright" },
  { id: "teen_male", label: "Teen Male", descriptor: "adolescent male, slight voice break" },
  { id: "teen_female", label: "Teen Female", descriptor: "adolescent female, clear and confident" },
];

export const EMOTION_MODIFIERS: Record<string, string> = {
  joy: "speak with warmth and brightness, slightly faster pace, uplifted tone, smile in the voice",
  sadness: "slow, heavy delivery, lower pitch, subdued, weight on each word, on the edge of tears",
  anger: "sharp, tense, clipped words, raised intensity, biting delivery, barely controlled",
  fear: "trembling, whispered, uneven breathing, halting pace, voice catching",
  surprise: "quick intake of breath feel, raised pitch, slightly breathless, off-guard energy",
  disgust: "flat contempt, slow sneering delivery, each word dropped with disdain",
  neutral: "clear, composed, natural pacing, no emotional coloring",
  whispering: "soft whisper, intimate, barely audible, breathy",
  shouting: "loud, forceful, projecting, commanding volume",
  crying: "broken voice, sobbing between words, wet and trembling",
  laughing: "words breaking into laughter, warm and amused, uncontrollable joy",
};

export interface VoiceProfile {
  name: string;
  gender: string;
  age: number;
  archetypeId: string;
  customNotes?: string;
}

export function assemblePrompt(profile: VoiceProfile, emotion?: string): string {
  const ageDesc = getAgeDescriptor(profile.age);
  const genderOpt = GENDER_OPTIONS.find(g => g.id === profile.gender);
  const archetype = findArchetype(profile.archetypeId);

  const parts: string[] = [];

  // Identity layer
  const genderStr = genderOpt?.descriptor || "voice";
  parts.push(`${ageDesc.label} ${genderStr}, aged around ${profile.age}, ${ageDesc.descriptors}.`);

  // Archetype layer
  if (archetype) {
    parts.push(`${archetype.name} archetype: ${archetype.descriptors}.`);
  }

  // Custom notes
  if (profile.customNotes?.trim()) {
    parts.push(profile.customNotes.trim() + ".");
  }

  // Emotion layer
  if (emotion && emotion !== "neutral" && EMOTION_MODIFIERS[emotion]) {
    parts.push(`Deliver with ${EMOTION_MODIFIERS[emotion]}.`);
  }

  return parts.join("\n");
}

export function assemblePromptPreview(profile: VoiceProfile): string {
  return assemblePrompt(profile, "neutral");
}
