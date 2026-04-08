"use client";

import { GENDER_OPTIONS } from "@/lib/prompt-assembler";

interface GenderPickerProps {
  value: string;
  onChange: (gender: string) => void;
}

export function GenderPicker({ value, onChange }: GenderPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Gender</label>
      <div className="flex flex-wrap gap-2">
        {GENDER_OPTIONS.map((g) => (
          <button
            key={g.id}
            onClick={() => onChange(g.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              value === g.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}
