/**
 * Character Archetype Library
 * Each archetype injects a preset descriptor block into the TTS instruct prompt.
 */

export interface Archetype {
  id: string;
  name: string;
  descriptors: string;
}

export interface ArchetypeCategory {
  id: string;
  name: string;
  icon: string;
  archetypes: Archetype[];
}

export const ARCHETYPE_CATEGORIES: ArchetypeCategory[] = [
  {
    id: "historical", name: "Historical", icon: "📜",
    archetypes: [
      { id: "roman_senator", name: "Roman Senator", descriptors: "authoritative, booming, deliberate oratory cadence, commanding gravity" },
      { id: "medieval_knight", name: "Medieval Knight", descriptors: "gruff, honorable, direct delivery, battle-worn confidence" },
      { id: "victorian_gentleman", name: "Victorian Gentleman", descriptors: "crisp diction, measured politeness, restrained emotion, refined" },
      { id: "ancient_wise_elder", name: "Ancient Wise Elder", descriptors: "slow, reverent, oceanic depth, each word carries weight" },
      { id: "samurai", name: "Samurai", descriptors: "clipped, precise, stoic, minimal inflection, quiet intensity" },
      { id: "pirate_captain", name: "Pirate Captain", descriptors: "raspy, boisterous, rolling rhythm, unpredictable energy" },
      { id: "egyptian_pharaoh", name: "Egyptian Pharaoh", descriptors: "imperious, slow, godly resonance, absolute authority" },
    ],
  },
  {
    id: "fantasy", name: "Fantasy", icon: "🏰",
    archetypes: [
      { id: "dark_wizard", name: "Dark Wizard", descriptors: "cold authority, ancient, echoing resonance, power beneath restraint" },
      { id: "elven_archer", name: "Elven Archer", descriptors: "light, musical, precise, ethereal edge to the voice" },
      { id: "dwarf_blacksmith", name: "Dwarf Blacksmith", descriptors: "gruff, short sentences, earthy warmth, blunt humor" },
      { id: "dragon", name: "Dragon", descriptors: "enormous resonance, slow, ancient contempt, earth-shaking bass" },
      { id: "fairy", name: "Fairy", descriptors: "bright, tinkling, rapid, playful, slightly mischievous" },
      { id: "demon_king", name: "Demon King", descriptors: "deep, smoky, unhurried menace, silken threat" },
      { id: "undead_lich", name: "Undead / Lich", descriptors: "hollow, echoing, slow, detached from mortal concerns" },
      { id: "forest_spirit", name: "Forest Spirit", descriptors: "breathy, natural rhythm, gentle but otherworldly" },
    ],
  },
  {
    id: "anime", name: "Anime & Cartoon", icon: "⚔️",
    archetypes: [
      { id: "shonen_hero", name: "Shonen Hero", descriptors: "passionate, determined, breathless, intensity rising at key moments" },
      { id: "tsundere", name: "Tsundere", descriptors: "sharp deflections, embarrassed undertone, sudden softness" },
      { id: "wise_sensei", name: "Wise Sensei", descriptors: "measured, warm, slow, pauses for effect, profound delivery" },
      { id: "anime_villain", name: "Anime Villain", descriptors: "silky, amused contempt, slow clapping energy, chilling calm" },
      { id: "comic_relief", name: "Comic Relief", descriptors: "bouncy, fast, stumbling over words, exaggerated reactions" },
      { id: "magical_girl", name: "Magical Girl", descriptors: "bright, hopeful, earnest, pure emotional delivery" },
      { id: "stoic_kuudere", name: "Stoic Kuudere", descriptors: "flat affect, minimal modulation, rare emotional peaks hit hard" },
    ],
  },
  {
    id: "scifi", name: "Sci-Fi & Futuristic", icon: "🚀",
    archetypes: [
      { id: "android_ai", name: "Android AI", descriptors: "flat affect, precise articulation, monotone baseline, subtle emotional leakage" },
      { id: "space_commander", name: "Space Commander", descriptors: "military authority, clipped precision, calm under pressure" },
      { id: "alien_diplomat", name: "Alien Diplomat", descriptors: "unusual rhythm, exotic cadence, hyper-correct pronunciation" },
      { id: "cyberpunk_hacker", name: "Cyberpunk Hacker", descriptors: "fast, sardonic, street-smart, occasional glitchy distortion hint" },
      { id: "robot_soldier", name: "Robot Soldier", descriptors: "mechanical cadence, no emotion, clipped responses" },
      { id: "time_traveler", name: "Time Traveler", descriptors: "slightly anachronistic speech, knowing tone, hints of exhaustion" },
    ],
  },
  {
    id: "realworld", name: "Real World", icon: "🌍",
    archetypes: [
      { id: "soldier", name: "Soldier", descriptors: "direct, mission-focused, clipped, controlled adrenaline" },
      { id: "doctor_scientist", name: "Doctor / Scientist", descriptors: "precise, calm, clinical, authoritative without arrogance" },
      { id: "street_kid", name: "Street Kid", descriptors: "fast, casual, defensive, survival-smart energy" },
      { id: "wise_grandparent", name: "Wise Grandparent", descriptors: "slow, warm, storytelling cadence, gentle humor" },
      { id: "news_anchor", name: "News Anchor", descriptors: "crisp, neutral, authoritative, broadcast professionalism" },
      { id: "villain", name: "Villain", descriptors: "smooth, patient, enjoying every word, terrifying calm" },
      { id: "mentor", name: "Mentor", descriptors: "warm, encouraging, knowing pauses, building toward insight" },
    ],
  },
];

export function findArchetype(id: string): Archetype | undefined {
  for (const cat of ARCHETYPE_CATEGORIES) {
    const found = cat.archetypes.find(a => a.id === id);
    if (found) return found;
  }
  return undefined;
}
