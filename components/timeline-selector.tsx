"use client";

import { TIMELINE_RANGES, type TimelineRange } from "@/lib/game-types";
import { cn } from "@/lib/utils";

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

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground text-center">
        Select the time period
      </p>
      <div className="grid grid-cols-5 gap-2">
        {ranges.map(([key, range]) => {
          const num = parseInt(key) as TimelineRange;
          const isSelected = selected === num;

          return (
            <button
              key={key}
              type="button"
              onClick={() => !disabled && onSelect(num)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg transition-all",
                "border-2",
                disabled && "opacity-50 cursor-not-allowed",
                isSelected
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-secondary border-border hover:border-primary/50 text-foreground"
              )}
            >
              <span className="text-2xl font-bold">{num}</span>
              <span className="text-[10px] leading-tight text-center mt-1 opacity-80">
                {range.name}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2">Timeline Legend:</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {ranges.map(([key, range]) => (
            <div key={key} className="flex justify-between">
              <span className="font-mono">{key}:</span>
              <span>{range.period}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
