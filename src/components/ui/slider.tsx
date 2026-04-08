"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false,
}: SliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const currentValue = value?.[0] ?? defaultValue?.[0] ?? min;
  const percent = ((currentValue - min) / (max - min)) * 100;

  const handlePointerEvent = React.useCallback(
    (clientX: number) => {
      if (disabled || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const stepped = Math.round(raw / step) * step;
      const clamped = Math.max(min, Math.min(max, stepped));
      onValueChange?.([clamped]);
    },
    [disabled, min, max, step, onValueChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerEvent(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (disabled || !e.buttons) return;
    handlePointerEvent(e.clientX);
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={currentValue}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "relative flex w-full touch-none select-none items-center h-5 cursor-pointer",
        disabled && "opacity-50 cursor-default",
        className
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={(e) => {
        if (disabled) return;
        let next = currentValue;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(max, currentValue + step);
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(min, currentValue - step);
        if (e.key === "Home") next = min;
        if (e.key === "End") next = max;
        if (next !== currentValue) {
          e.preventDefault();
          onValueChange?.([next]);
        }
      }}
    >
      {/* Track */}
      <div className="relative h-1 w-full rounded-full bg-muted overflow-hidden">
        {/* Filled range */}
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* Thumb */}
      <div
        className="absolute block size-4 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow-sm ring-ring/50 transition-shadow hover:ring-2 focus-visible:ring-2"
        style={{ left: `${percent}%` }}
      />
    </div>
  );
}

export { Slider };
