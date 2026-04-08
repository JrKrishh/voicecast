"use client";

import { useState } from "react";
import { ARCHETYPE_CATEGORIES } from "@/lib/archetype-map";

interface ArchetypePickerProps {
  value: string;
  onChange: (archetypeId: string) => void;
}

export function ArchetypePicker({ value, onChange }: ArchetypePickerProps) {
  const [categoryId, setCategoryId] = useState(() => {
    for (const cat of ARCHETYPE_CATEGORIES) {
      if (cat.archetypes.some(a => a.id === value)) return cat.id;
    }
    return ARCHETYPE_CATEGORIES[0].id;
  });

  const activeCategory = ARCHETYPE_CATEGORIES.find(c => c.id === categoryId) || ARCHETYPE_CATEGORIES[0];

  return (
    <div className="space-y-3">
      <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Character Archetype</label>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {ARCHETYPE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              categoryId === cat.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Archetype grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {activeCategory.archetypes.map((arch) => (
          <button
            key={arch.id}
            onClick={() => onChange(arch.id)}
            className={`p-3 rounded-lg text-left transition-all border ${
              value === arch.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <p className={`text-sm font-medium ${value === arch.id ? "text-primary" : "text-foreground"}`}>
              {arch.name}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
              {arch.descriptors}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
