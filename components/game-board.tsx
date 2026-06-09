"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { AvatarIcon } from "@/components/avatar-icon";
import { TimelineSelector } from "@/components/timeline-selector";
import { MovieGuessSelector } from "@/components/movie-guess-selector";
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
  Category,
  GameMode,
  RoundResults,
} from "@/lib/game-types";
import { Loader2, Clock, Users, Languages } from "lucide-react";

interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: Category;
  choices?: string[];
}

interface GameState {
  id: string;
  code: string;
  status: "waiting" | "playing" | "finished";
  mode: GameMode;
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
  roundResults?: RoundResults | null;
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
  const lastRoundRef = useRef<number | null>(null);
  const lastResultsRoundRef = useRef<number | null>(null);

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

        if (player) {
          setHasSubmitted(Boolean(data.players[player.id]?.hasSubmitted));
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
    if (!game || !player) return;

    if (lastRoundRef.current === null) {
      lastRoundRef.current = game.currentRound;
      return;
    }

    if (lastRoundRef.current !== game.currentRound) {
      setHasSubmitted(false);
      setSelectedAnswer(null);
      setShowResults(false);
      setResults(null);
      lastRoundRef.current = game.currentRound;
    }
  }, [game?.currentRound, game, player]);

  useEffect(() => {
    if (!game?.roundResults) return;
    if (lastResultsRoundRef.current === game.roundResults.round) return;

    setResults(game.roundResults);
    setShowResults(true);
    lastResultsRoundRef.current = game.roundResults.round;
  }, [game?.roundResults]);

  useEffect(() => {
    if (!results || !game?.winnerId || game.status !== "finished") return;

    const timer = setTimeout(() => {
      setShowResults(false);
      setShowWinner(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [results, game?.winnerId, game?.status]);

  const handleSubmit = async () => {
    if (!player || selectedAnswer === null || hasSubmitted || game?.status !== "playing") return;

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

  const handleNextRound = () => {
    if (game?.status === "finished" && game.winnerId) {
      setShowResults(false);
      setShowWinner(true);
      return;
    }

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
  const allSubmitted = game.submissionStatus.allSubmitted;
  const isChoiceMode = game.mode === "MOVIE_GUESS" || game.mode === "HARRY_POTTER";
  const choiceTitle =
    game.mode === "MOVIE_GUESS" ? "Movie Synopsis" : "Wizarding World Question";
  const translateEventText = () => {
    if (!game.currentEvent) return;
    const text = isChoiceMode
      ? game.currentEvent.description
      : `${game.currentEvent.title} - ${game.currentEvent.description}`;
    const url = `https://translate.google.com/?sl=en&tl=th&text=${encodeURIComponent(
      text
    )}&op=translate`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card/90 backdrop-blur">
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
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-secondary/60 via-background to-primary/10 p-4 shadow-sm">
          <BoardTrack 
            tiles={game.boardTiles} 
            players={players} 
            currentPlayerId={player.id}
          />
        </div>
      </div>

      {/* Event Card */}
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl border border-border p-6 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="px-2 py-1 bg-secondary rounded text-xs font-medium text-muted-foreground">
                {game.currentEvent.category}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={translateEventText}
              >
                <Languages className="w-4 h-4" />
                Translate to Thai
              </Button>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {isChoiceMode ? choiceTitle : game.currentEvent.title}
            </h2>
            <p className="text-muted-foreground">
              {game.currentEvent.description}
            </p>
          </div>

          {/* Timeline Selector */}
          {!showResults && (
            <>
              {isChoiceMode ? (
                <MovieGuessSelector
                  choices={game.currentEvent.choices ?? []}
                  selected={selectedAnswer}
                  onSelect={(value) => setSelectedAnswer(value as TimelineRange)}
                  disabled={hasSubmitted}
                />
              ) : (
                <TimelineSelector
                  mode={game.mode}
                  selected={selectedAnswer}
                  onSelect={setSelectedAnswer}
                  disabled={hasSubmitted}
                />
              )}

              {/* Submit / Status */}
              <div className="mt-6">
                {!hasSubmitted ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null || isSubmitting || game.status !== "playing"}
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

                    {allSubmitted && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Auto-revealing answers for everyone...
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
                  {isChoiceMode ? "Score" : "Position"}: {p.position}
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
          mode={game.mode}
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
