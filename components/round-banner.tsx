"use client";

import { ROUND_EFFECTS, type RoundType, type Category } from "@/lib/game-types";
import { AlertTriangle, HelpCircle, Tag, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoundBannerProps {
  roundType: RoundType;
  hint?: string;
  category?: Category | null;
}

const roundStyles: Record<RoundType, { bg: string; icon: typeof Zap; label: string }> = {
  NORMAL: {
    bg: "bg-secondary",
    icon: Zap,
    label: "Normal Round",
  },
  RISK: {
    bg: "bg-game-risk/20",
    icon: AlertTriangle,
    label: "Risk Round",
  },
  SUPPORT: {
    bg: "bg-game-support/20",
    icon: HelpCircle,
    label: "Support Round",
  },
  CATEGORY: {
    bg: "bg-game-category/20",
    icon: Tag,
    label: "Category Round",
  },
};

export function RoundBanner({ roundType, hint, category }: RoundBannerProps) {
  const style = roundStyles[roundType];
  const effect = ROUND_EFFECTS[roundType];
  const Icon = style.icon;

  return (
    <div className={cn("px-4 py-3", style.bg)}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-foreground" />
            <span className="font-semibold text-foreground">{style.label}</span>
            {category && (
              <span className="px-2 py-0.5 bg-background/50 rounded text-xs font-medium">
                {category}
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {effect.description}
          </span>
        </div>
        
        {hint && (
          <p className="mt-2 text-sm text-foreground/80 italic">
            Hint: {hint}
          </p>
        )}
      </div>
    </div>
  );
}
