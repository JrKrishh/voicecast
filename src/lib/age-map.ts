/**
 * Age → Voice Descriptor Map
 * Maps age (1-100) to vocal characteristics injected into the TTS instruct prompt.
 */

export interface AgeDescriptor {
  label: string;
  range: [number, number];
  descriptors: string;
}

export const AGE_MAP: AgeDescriptor[] = [
  { range: [1, 3], label: "Infant", descriptors: "very soft, babbling, high-pitched, breathless, unstable pitch" },
  { range: [4, 7], label: "Young Child", descriptors: "light, playful, high-pitched, slightly breathless, wide-eyed energy" },
  { range: [8, 12], label: "Kid", descriptors: "energetic, clear, mid-high pitch, curious tone, no affectation" },
  { range: [13, 15], label: "Early Teen", descriptors: "slightly cracking (male), confident (female), casual register" },
  { range: [16, 17], label: "Teen", descriptors: "more settled, slightly edgy, youthful authority" },
  { range: [18, 25], label: "Young Adult", descriptors: "clear, energetic, full vocal range, modern rhythm" },
  { range: [26, 35], label: "Adult", descriptors: "confident, composed, rich timbre, measured pacing" },
  { range: [36, 45], label: "Mid Adult", descriptors: "mature, assured, slight gravitas in voice" },
  { range: [46, 55], label: "Middle Aged", descriptors: "settled, measured, deeper register, slight weight" },
  { range: [56, 65], label: "Senior Adult", descriptors: "warm, slower pace, slight rasp beginning to show" },
  { range: [66, 75], label: "Senior", descriptors: "gravelly, slower, weathered edges, deliberate delivery" },
  { range: [76, 85], label: "Elderly", descriptors: "fragile edges, thin tone, slower tempo, warm but worn" },
  { range: [86, 100], label: "Very Elderly", descriptors: "very slow, trembling, whispery, thin, each word deliberate" },
];

export function getAgeDescriptor(age: number): AgeDescriptor {
  return AGE_MAP.find(a => age >= a.range[0] && age <= a.range[1]) || AGE_MAP[5];
}

export function getAgeLabel(age: number): string {
  return getAgeDescriptor(age).label;
}
