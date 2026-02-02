"use client";

import { cn } from "@/lib/utils";

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
      <p className="text-sm font-medium text-foreground text-center">
        Select the correct title
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {choices.map((choice, index) => {
          const isSelected = selected === index;

          return (
            <button
              key={`${choice}-${index}`}
              type="button"
              onClick={() => !disabled && onSelect(index)}
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
                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border"
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-sm font-medium">{choice}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
