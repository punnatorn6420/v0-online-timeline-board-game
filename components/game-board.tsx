"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { AvatarIcon } from "@/components/avatar-icon";
import { TimelineSelector } from "@/components/timeline-selector";
import { RoundBanner } from "@/components/round-banner";
import { BoardTrack } from "@/components/board-track";
import { ResultsModal } from "@/components/results-modal";
import { WinnerModal } from "@/components/winner-modal";
import { usePlayer } from "@/lib/player-context";
import { firestore } from "@/lib/firebase-client";
import type { 
  Player, 
  AvatarId, 
  RoundType, 
  BoardTile, 
  TimelineRange,
  Category 
} from "@/lib/game-types";
import { Loader2, Clock, Users } from "lucide-react";

interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: Category;
}

interface GameState {
  id: string;
  code: string;
  status: "waiting" | "playing" | "finished";
  players: Record<string, Player>;
  hostId: string;
  currentRound: number;
  roundType: RoundType;
  boardTiles: BoardTile[];
  winnerId: string | null;
  hint?: string | null;
  forcedCategory?: Category | null;
  currentEvent: GameEvent | null;
  submissionStatus: {
    total: number;
    submitted: number;
    allSubmitted: boolean;
  };
}

interface RoundResults {
  correctRange: TimelineRange;
  players: Array<{
    id: string;
    displayName: string;
    answer: TimelineRange | null;
    correct: boolean;
    movement: number;
    newPosition: number;
  }>;
}

interface GameBoardProps {
  roomId: string;
  roomCode: string;
}

export function GameBoard({ roomId, roomCode }: GameBoardProps) {
  const router = useRouter();
  const { player } = usePlayer();
  const [game, setGame] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<TimelineRange | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<RoundResults | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const buildSubmissionStatus = (players: Record<string, Player>) => {
    const total = Object.keys(players).length;
    const submitted = Object.values(players).filter((p) => p.hasSubmitted).length;
    return {
      total,
      submitted,
      allSubmitted: total > 0 && submitted === total,
    };
  };
  
  useEffect(() => {
    const roomRef = doc(firestore, "rooms", roomId);
    const unsubscribe = onSnapshot(
      roomRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("Room not found");
          setIsLoading(false);
          return;
        }

        const data = snapshot.data() as GameState;
        setGame({
          id: snapshot.id,
          ...data,
          submissionStatus: buildSubmissionStatus(data.players),
        });

        if (player && data.players[player.id]?.hasSubmitted) {
          setHasSubmitted(true);
        }

        if (data.winnerId && data.status === "finished") {
          setShowWinner(true);
        }

        setIsLoading(false);
      },
      () => {
        setError("Failed to load game");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId, player]);

  // Reset state when round changes
  useEffect(() => {
    if (game && player) {
      const currentPlayer = game.players[player.id];
      if (currentPlayer && !currentPlayer.hasSubmitted) {
        setHasSubmitted(false);
        setSelectedAnswer(null);
        setShowResults(false);
        setResults(null);
      }
    }
  }, [game?.currentRound, game, player]);

  const handleSubmit = async () => {
    if (!player || selectedAnswer === null || hasSubmitted) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          roomId,
          playerId: player.id,
          answer: selectedAnswer,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setHasSubmitted(true);
      } else {
        setError(data.error || "Failed to submit answer");
      }
    } catch {
      setError("Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReveal = async () => {
    if (!player || !game) return;

    setIsRevealing(true);
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reveal",
          roomId,
          playerId: player.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.results);
        setShowResults(true);
        
        if (data.gameFinished && data.winnerId) {
          // Show results first, then winner
          setTimeout(() => {
            setShowResults(false);
            setShowWinner(true);
          }, 3000);
        }
      } else {
        setError(data.error || "Failed to reveal results");
      }
    } catch {
      setError("Failed to reveal results");
    } finally {
      setIsRevealing(false);
    }
  };

  const handleNextRound = () => {
    setShowResults(false);
    setResults(null);
    setHasSubmitted(false);
    setSelectedAnswer(null);
  };

  if (!player) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            You need to create a character first
          </p>
          <Button onClick={() => router.push("/")}>Go to Home</Button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (error && !game) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Go to Home</Button>
        </div>
      </main>
    );
  }

  if (!game || !game.currentEvent) return null;

  const players = Object.values(game.players);
  const currentPlayer = game.players[player.id];
  const isHost = player.id === game.hostId;
  const allSubmitted = game.submissionStatus.allSubmitted;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Timeline</span>
          <span className="text-muted-foreground text-sm ml-2">
            {roomCode}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={16} />
            <span>{players.length}</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            Round {game.currentRound}
          </span>
        </div>
      </header>

      {/* Round Banner */}
      <RoundBanner 
        roundType={game.roundType} 
        hint={game.hint}
        category={game.forcedCategory}
      />

      {/* Board Track */}
      <div className="p-4 overflow-x-auto">
        <BoardTrack 
          tiles={game.boardTiles} 
          players={players} 
          currentPlayerId={player.id}
        />
      </div>

      {/* Event Card */}
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-secondary rounded text-xs font-medium text-muted-foreground">
                {game.currentEvent.category}
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {game.currentEvent.title}
            </h2>
            <p className="text-muted-foreground">
              {game.currentEvent.description}
            </p>
          </div>

          {/* Timeline Selector */}
          {!showResults && (
            <>
              <TimelineSelector
                selected={selectedAnswer}
                onSelect={setSelectedAnswer}
                disabled={hasSubmitted}
              />

              {/* Submit / Status */}
              <div className="mt-6">
                {!hasSubmitted ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null || isSubmitting}
                    className="w-full h-12"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Submitting...
                      </>
                    ) : (
                      "Submit Answer"
                    )}
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-game-success font-medium mb-2">
                      Answer submitted!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {game.submissionStatus.submitted} / {game.submissionStatus.total} players submitted
                    </p>

                    {/* Host can reveal when all submitted */}
                    {isHost && allSubmitted && (
                      <Button
                        onClick={handleReveal}
                        disabled={isRevealing}
                        className="mt-4"
                        size="lg"
                      >
                        {isRevealing ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" size={20} />
                            Revealing...
                          </>
                        ) : (
                          "Reveal Answers"
                        )}
                      </Button>
                    )}

                    {!isHost && allSubmitted && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Waiting for host to reveal answers...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Players Bar */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {players.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg shrink-0 ${
                p.id === player.id 
                  ? "bg-primary/10 border border-primary" 
                  : "bg-secondary"
              }`}
            >
              <AvatarIcon avatarId={p.avatar as AvatarId} size="sm" />
              <div className="text-sm">
                <p className="font-medium text-foreground">{p.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  Position: {p.position}
                </p>
              </div>
              {p.hasSubmitted && (
                <div className="w-2 h-2 rounded-full bg-game-success" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Results Modal */}
      {showResults && results && (
        <ResultsModal
          results={results}
          currentPlayerId={player.id}
          onContinue={handleNextRound}
        />
      )}

      {/* Winner Modal */}
      {showWinner && game.winnerId && (
        <WinnerModal
          winner={game.players[game.winnerId]}
          isCurrentPlayer={game.winnerId === player.id}
          onClose={() => router.push("/")}
        />
      )}
    </main>
  );
}
