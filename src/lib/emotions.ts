/**
 * Emotion system — maps detected emotions to voice modifiers
 * and provides client-side keyword-based sentiment detection.
 *
 * In production, this is replaced by the distilroberta Python service.
 * For now, keyword matching gives instant feedback in the UI.
 */

export interface EmotionResult {
  emotion: string;
  confidence: number;
  secondary?: string;
  secondaryConfidence?: number;
}

export const EMOTIONS = [
  { id: "joy", label: "Joy", emoji: "😊", color: "text-yellow-400" },
  { id: "sadness", label: "Sadness", emoji: "😢", color: "text-blue-400" },
  { id: "anger", label: "Anger", emoji: "😠", color: "text-red-400" },
  { id: "fear", label: "Fear", emoji: "😨", color: "text-purple-400" },
  { id: "surprise", label: "Surprise", emoji: "😲", color: "text-orange-400" },
  { id: "disgust", label: "Disgust", emoji: "🤢", color: "text-green-400" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "text-muted-foreground" },
  { id: "whispering", label: "Whispering", emoji: "🤫", color: "text-slate-400" },
  { id: "shouting", label: "Shouting", emoji: "📢", color: "text-red-500" },
  { id: "crying", label: "Crying", emoji: "😭", color: "text-blue-500" },
  { id: "laughing", label: "Laughing", emoji: "😂", color: "text-yellow-500" },
] as const;

export type EmotionId = (typeof EMOTIONS)[number]["id"];

export function getEmotion(id: string) {
  return EMOTIONS.find(e => e.id === id) || EMOTIONS[6]; // default neutral
}

// ── Client-side keyword sentiment detection ──
// Quick heuristic until the real distilroberta service is connected

const KEYWORD_MAP: Record<string, { words: string[]; weight: number }> = {
  anger: {
    words: ["dare", "fool", "destroy", "kill", "hate", "fury", "rage", "enough", "silence", "kneel", "pathetic", "wrath", "curse", "damn", "die", "never forgive", "how dare", "insolent"],
    weight: 1,
  },
  joy: {
    words: ["love", "wonderful", "beautiful", "happy", "glad", "amazing", "brilliant", "fantastic", "delighted", "blessed", "grateful", "thank", "celebrate", "hooray", "yes!"],
    weight: 1,
  },
  sadness: {
    words: ["sorry", "lost", "gone", "miss", "alone", "tears", "weep", "mourn", "farewell", "goodbye", "never again", "forgotten", "broken", "empty", "regret", "wish"],
    weight: 1,
  },
  fear: {
    words: ["afraid", "scared", "terror", "run", "hide", "danger", "help", "please no", "don't", "dark", "shadow", "coming", "trapped", "escape", "nightmare"],
    weight: 1,
  },
  surprise: {
    words: ["what", "impossible", "how", "can't believe", "unexpected", "suddenly", "wait", "really", "no way", "incredible"],
    weight: 0.8,
  },
  disgust: {
    words: ["disgusting", "vile", "pathetic", "revolting", "beneath", "worthless", "filth", "repulsive", "contempt", "loathe"],
    weight: 1,
  },
};

export function detectEmotion(text: string): EmotionResult {
  if (!text.trim()) return { emotion: "neutral", confidence: 1 };

  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [emotion, { words, weight }] of Object.entries(KEYWORD_MAP)) {
    let count = 0;
    for (const word of words) {
      if (lower.includes(word)) count++;
    }
    if (count > 0) {
      scores[emotion] = (count / words.length) * weight;
    }
  }

  // Exclamation marks boost intensity
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 0 && scores["anger"]) scores["anger"] *= 1 + exclamations * 0.2;
  if (exclamations > 0 && scores["joy"]) scores["joy"] *= 1 + exclamations * 0.15;

  // Question marks suggest surprise
  const questions = (text.match(/\?/g) || []).length;
  if (questions > 0) scores["surprise"] = (scores["surprise"] || 0) + questions * 0.1;

  // ALL CAPS = shouting/anger boost
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
  if (capsRatio > 0.5 && text.length > 5) {
    scores["anger"] = (scores["anger"] || 0) + 0.3;
  }

  // Ellipsis = sadness/contemplation
  if (text.includes("...")) {
    scores["sadness"] = (scores["sadness"] || 0) + 0.15;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return { emotion: "neutral", confidence: 1 };
  }

  const top = sorted[0];
  const confidence = Math.min(0.99, 0.55 + top[1] * 2);
  const result: EmotionResult = { emotion: top[0], confidence };

  // Secondary emotion if close enough
  if (sorted.length > 1 && sorted[1][1] > 0.05) {
    result.secondary = sorted[1][0];
    result.secondaryConfidence = Math.min(0.99, 0.4 + sorted[1][1] * 2);
  }

  return result;
}
