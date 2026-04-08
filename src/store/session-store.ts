import { create } from "zustand";
import { detectEmotion, type EmotionResult } from "@/lib/emotions";

export interface DialogueLine {
  id: string;
  text: string;
  detectedEmotion: EmotionResult;
  emotionOverride: string | null; // null = use auto-detected
  audioUrl: string | null;
  isGenerating: boolean;
  durationSeconds: number | null;
}

interface SessionState {
  // Selected voice profile
  voiceProfileId: string | null;
  voiceProfileName: string;

  // Dialogue lines
  lines: DialogueLine[];

  // Actions
  setVoiceProfile: (id: string, name: string) => void;
  addLine: () => void;
  removeLine: (id: string) => void;
  updateLineText: (id: string, text: string) => void;
  setEmotionOverride: (id: string, emotion: string | null) => void;
  setLineAudio: (id: string, audioUrl: string, duration: number) => void;
  setLineGenerating: (id: string, generating: boolean) => void;
  clearLineAudio: (id: string) => void;
}

let lineCounter = 0;
function createLine(): DialogueLine {
  lineCounter++;
  return {
    id: `line_${lineCounter}_${Date.now()}`,
    text: "",
    detectedEmotion: { emotion: "neutral", confidence: 1 },
    emotionOverride: null,
    audioUrl: null,
    isGenerating: false,
    durationSeconds: null,
  };
}

export const useSessionStore = create<SessionState>((set) => ({
  voiceProfileId: null,
  voiceProfileName: "Select a voice...",
  lines: [createLine(), createLine(), createLine()],

  setVoiceProfile: (id, name) => set({ voiceProfileId: id, voiceProfileName: name }),

  addLine: () => set((s) => ({ lines: [...s.lines, createLine()] })),

  removeLine: (id) =>
    set((s) => ({
      lines: s.lines.length > 1 ? s.lines.filter((l) => l.id !== id) : s.lines,
    })),

  updateLineText: (id, text) =>
    set((s) => ({
      lines: s.lines.map((l) =>
        l.id === id
          ? { ...l, text, detectedEmotion: detectEmotion(text) }
          : l
      ),
    })),

  setEmotionOverride: (id, emotion) =>
    set((s) => ({
      lines: s.lines.map((l) =>
        l.id === id ? { ...l, emotionOverride: emotion } : l
      ),
    })),

  setLineAudio: (id, audioUrl, duration) =>
    set((s) => ({
      lines: s.lines.map((l) =>
        l.id === id
          ? { ...l, audioUrl, durationSeconds: duration, isGenerating: false }
          : l
      ),
    })),

  setLineGenerating: (id, generating) =>
    set((s) => ({
      lines: s.lines.map((l) =>
        l.id === id ? { ...l, isGenerating: generating } : l
      ),
    })),

  clearLineAudio: (id) =>
    set((s) => ({
      lines: s.lines.map((l) =>
        l.id === id ? { ...l, audioUrl: null, durationSeconds: null } : l
      ),
    })),
}));
