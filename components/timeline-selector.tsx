"use client";

import { TIMELINE_RANGES, type TimelineRange } from "@/lib/game-types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Mountain,
  Landmark,
  Shield,
  Swords,
  Compass,
  Factory,
  Cog,
  Bomb,
  Rocket,
  Cpu,
} from "lucide-react";

interface TimelineSelectorProps {
  selected: TimelineRange | null;
  onSelect: (range: TimelineRange) => void;
  disabled?: boolean;
}

export function TimelineSelector({
  selected,
  onSelect,
  disabled = false,
}: TimelineSelectorProps) {
  const ranges = Object.entries(TIMELINE_RANGES) as [string, typeof TIMELINE_RANGES[0]][];
  const rangeIcons: Record<TimelineRange, LucideIcon> = {
    0: Mountain,
    1: Landmark,
    2: Shield,
    3: Swords,
    4: Compass,
    5: Factory,
    6: Cog,
    7: Bomb,
    8: Rocket,
    9: Cpu,
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground text-center">
        Select the time period
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ranges.map(([key, range]) => {
          const num = parseInt(key) as TimelineRange;
          const isSelected = selected === num;
          const Icon = rangeIcons[num];

          return (
            <button
              key={key}
              type="button"
              onClick={() => !disabled && onSelect(num)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                "border-2 text-left shadow-sm",
                disabled && "opacity-50 cursor-not-allowed",
                isSelected
                  ? "bg-primary/90 border-primary text-primary-foreground scale-[1.01]"
                  : "bg-secondary border-border hover:border-primary/50 text-foreground hover:-translate-y-0.5"
              )}
            >
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border"
                )}
              >
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{num}</span>
                  <span className="text-sm font-semibold">{range.name}</span>
                </div>
                <p className="text-xs opacity-80">{range.period}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
