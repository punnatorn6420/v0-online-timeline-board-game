"use client";

import { Button } from "@/components/ui/button";
import { AvatarIcon } from "@/components/avatar-icon";
import type { Player, AvatarId } from "@/lib/game-types";
import { Trophy, Home, RotateCcw, Loader2 } from "lucide-react";

interface WinnerModalProps {
  winner: Player;
  isCurrentPlayer: boolean;
  onClose: () => void;
  canPlayAgain?: boolean;
  isResetting?: boolean;
  onPlayAgain?: () => void;
}

export function WinnerModal({
  winner,
  isCurrentPlayer,
  onClose,
  canPlayAgain = false,
  isResetting = false,
  onPlayAgain,
}: WinnerModalProps) {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95">
        {/* Trophy */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-accent" />
        </div>

        {/* Winner Info */}
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isCurrentPlayer ? "You Win!" : "Game Over!"}
        </h2>

        <div className="flex items-center justify-center gap-3 mb-6">
          <AvatarIcon avatarId={winner.avatar as AvatarId} size="lg" />
          <div className="text-left">
            <p className="text-xl font-semibold text-foreground">
              {winner.displayName}
            </p>
            <p className="text-muted-foreground">
              {isCurrentPlayer ? "Congratulations!" : "Winner"}
            </p>
          </div>
        </div>

        <p className="text-muted-foreground mb-8">
          {isCurrentPlayer
            ? "You reached the finish line first!"
            : `${winner.displayName} reached the finish line first!`}
        </p>

        <div className="space-y-3">
          {canPlayAgain && onPlayAgain && (
            <Button
              onClick={onPlayAgain}
              disabled={isResetting}
              size="lg"
              className="w-full"
            >
              {isResetting ? (
                <Loader2 className="mr-2 animate-spin" size={20} />
              ) : (
                <RotateCcw className="mr-2" size={20} />
              )}
              {isResetting ? "Resetting..." : "Play Again"}
            </Button>
          )}
          <Button
            onClick={onClose}
            size="lg"
            variant={canPlayAgain ? "secondary" : "default"}
            className="w-full"
          >
            <Home className="mr-2" size={20} />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
