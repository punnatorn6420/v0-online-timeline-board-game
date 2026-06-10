"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface MovieGuessSelectorProps {
  choices: string[];
  selected: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function MovieGuessSelector({
  choices,
  selected,
  onSelect,
  disabled = false,
}: MovieGuessSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
        <span className="h-px w-10 bg-border" />
        <p>Select the correct title</p>
        <span className="h-px w-10 bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {choices.map((choice, index) => {
          const isSelected = selected === index;
          const StatusIcon = isSelected ? CheckCircle2 : Circle;

          return (
            <button
              key={`${choice}-${index}`}
              type="button"
              onClick={() => !disabled && onSelect(index)}
              disabled={disabled}
              className={cn(
                "group flex min-h-20 items-center gap-3 rounded-xl p-3 text-left",
                "border-2 shadow-sm transition-all duration-200",
                "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
                disabled && "opacity-50 cursor-not-allowed",
                isSelected
                  ? "bg-primary/90 border-primary text-primary-foreground shadow-primary/20 scale-[1.01]"
                  : "bg-secondary border-border text-foreground hover:border-primary/60 hover:bg-secondary/80 hover:-translate-y-0.5"
              )}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-transform group-hover:scale-105",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border"
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 text-sm font-medium leading-snug">
                {choice}
              </span>
              <StatusIcon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
