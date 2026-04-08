"use client";

import { Slider } from "@/components/ui/slider";
import { getAgeLabel } from "@/lib/age-map";

interface AgeSliderProps {
  value: number;
  onChange: (age: number) => void;
}

export function AgeSlider({ value, onChange }: AgeSliderProps) {
  const label = getAgeLabel(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Age</label>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">{label}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={1}
        max={100}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Infant</span>
        <span>Child</span>
        <span>Teen</span>
        <span>Adult</span>
        <span>Senior</span>
        <span>Elderly</span>
      </div>
    </div>
  );
}
