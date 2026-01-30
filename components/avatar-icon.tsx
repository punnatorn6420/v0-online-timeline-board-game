"use client";

import {
  Compass,
  BookOpen,
  Lightbulb,
  Shield,
  Palette,
  FlaskConical,
  Map,
  Brain,
} from "lucide-react";
import type { AvatarId } from "@/lib/game-types";
import { cn } from "@/lib/utils";

const iconMap = {
  explorer: Compass,
  scholar: BookOpen,
  inventor: Lightbulb,
  warrior: Shield,
  artist: Palette,
  scientist: FlaskConical,
  navigator: Map,
  philosopher: Brain,
};

const colorMap: Record<AvatarId, string> = {
  explorer: "bg-primary/20 text-primary",
  scholar: "bg-accent/20 text-accent",
  inventor: "bg-game-warning/20 text-game-warning",
  warrior: "bg-game-danger/20 text-game-danger",
  artist: "bg-game-category/20 text-game-category",
  scientist: "bg-game-support/20 text-game-support",
  navigator: "bg-game-success/20 text-game-success",
  philosopher: "bg-game-risk/20 text-game-risk",
};

interface AvatarIconProps {
  avatarId: AvatarId;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBorder?: boolean;
}

export function AvatarIcon({
  avatarId,
  size = "md",
  className,
  showBorder = false,
}: AvatarIconProps) {
  const Icon = iconMap[avatarId];
  
  const sizeClasses = {
    sm: "w-8 h-8 p-1.5",
    md: "w-12 h-12 p-2.5",
    lg: "w-16 h-16 p-3",
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center",
        colorMap[avatarId],
        sizeClasses[size],
        showBorder && "ring-2 ring-border",
        className
      )}
    >
      <Icon size={iconSizes[size]} />
    </div>
  );
}
