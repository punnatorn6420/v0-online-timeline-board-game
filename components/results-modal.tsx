"use client";

import { Button } from "@/components/ui/button";
import { getRangesForMode, type GameMode, type RoundResults } from "@/lib/game-types";
import { Check, X, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsModalProps {
  results: RoundResults;
  mode: GameMode;
  currentPlayerId: string;
  onContinue: () => void;
}

export function ResultsModal({
  results,
  mode,
  currentPlayerId,
  onContinue,
}: ResultsModalProps) {
  const ranges = getRangesForMode(mode);
  const correctRangeInfo = ranges[results.correctRange];
  const isMovieGuess = mode === "MOVIE_GUESS";

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Correct Answer */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Correct Answer</p>
          <div className="inline-flex items-center gap-3 px-4 py-3 bg-game-success/20 rounded-lg">
            {isMovieGuess ? (
              <div className="text-left">
                <p className="text-lg font-semibold text-game-success">
                  {results.correctAnswerText ?? "Unknown title"}
                </p>
              </div>
            ) : (
              <>
                <span className="text-3xl font-bold text-game-success">
                  {results.correctRange}
                </span>
                <div className="text-left">
                  {correctRangeInfo ? (
                    <>
                      <p className="font-medium text-foreground">
                        {correctRangeInfo.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {correctRangeInfo.period}
                      </p>
                    </>
                  ) : (
                    <p className="font-medium text-foreground">Unknown range</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Player Results */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-foreground">Results</p>
          {results.players.map((player) => {
            const isCurrentPlayer = player.id === currentPlayerId;
            
            return (
              <div
                key={player.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  isCurrentPlayer ? "bg-primary/10" : "bg-secondary"
                )}
              >
                {/* Correct/Wrong indicator */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    player.correct 
                      ? "bg-game-success/20 text-game-success" 
                      : "bg-destructive/20 text-destructive"
                  )}
                >
                  {player.correct ? <Check size={18} /> : <X size={18} />}
                </div>

                {/* Player info */}
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {player.displayName}
                    {isCurrentPlayer && (
                      <span className="text-muted-foreground text-sm ml-1">
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Answered:{" "}
                    {player.answer !== null
                      ? results.answerLabels?.[player.answer] ?? player.answer
                      : "—"}
                  </p>
                </div>

                {/* Movement */}
                <div className="flex items-center gap-1">
                  {player.movement > 0 ? (
                    <ArrowUp className="w-4 h-4 text-game-success" />
                  ) : player.movement < 0 ? (
                    <ArrowDown className="w-4 h-4 text-destructive" />
                  ) : (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      player.movement > 0 && "text-game-success",
                      player.movement < 0 && "text-destructive",
                      player.movement === 0 && "text-muted-foreground"
                    )}
                  >
                    {player.movement > 0 && "+"}
                    {player.movement}
                  </span>
                </div>

                {/* New position */}
                <div className="text-sm text-muted-foreground">
                  Pos: {player.newPosition}
                </div>
              </div>
            );
          })}
        </div>

        <Button onClick={onContinue} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
}
