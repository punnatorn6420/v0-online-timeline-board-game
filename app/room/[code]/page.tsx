"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { AvatarIcon } from "@/components/avatar-icon";
import { usePlayer } from "@/lib/player-context";
import { firestore } from "@/lib/firebase-client";
import type { Player, AvatarId, GameMode } from "@/lib/game-types";
import { 
  Copy, 
  Check, 
  Users, 
  Crown, 
  Clock, 
  Play,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { GameBoard } from "@/components/game-board";

interface RoomData {
  id: string;
  code: string;
  status: "waiting" | "playing" | "finished";
  players: Record<string, Player>;
  hostId: string;
  mode?: GameMode;
}

export default function RoomPage({ 
  params 
}: { 
  params: Promise<{ code: string }> 
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { player } = usePlayer();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const roomQuery = query(
      collection(firestore, "rooms"),
      where("code", "==", resolvedParams.code.toUpperCase()),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      roomQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setRoom(null);
          setError("Room not found");
          setIsLoading(false);
          return;
        }

        const doc = snapshot.docs[0];
        setRoom({ id: doc.id, ...(doc.data() as RoomData) });
        setError("");
        setIsLoading(false);
      },
      () => {
        setError("Failed to load room");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [resolvedParams.code]);

  // Auto-join if player exists but not in room
  useEffect(() => {
    if (!player || !room || room.players[player.id]) return;
    if (room.status !== "waiting") return;

    const joinRoom = async () => {
      try {
        const response = await fetch("/api/rooms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: resolvedParams.code,
            playerId: player.id,
            playerName: player.displayName,
            playerAvatar: player.avatar,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setRoom(data.room);
        } else {
          setError(data.error || "Failed to join room");
        }
      } catch {
        setError("Failed to join room");
      }
    };

    joinRoom();
  }, [player, room, resolvedParams.code]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(resolvedParams.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    if (!player || !room) return;

    setIsStarting(true);
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          roomId: room.id,
          playerId: player.id,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.error || "Failed to start game");
      }
      // Room status will update via polling
    } catch {
      setError("Failed to start game");
    } finally {
      setIsStarting(false);
    }
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

  if (error && !room) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Go to Home</Button>
        </div>
      </main>
    );
  }

  if (!room) return null;

  const modeLabel =
    room.mode === "THAILAND"
      ? "Thailand Timeline"
      : room.mode === "SCIENCE"
        ? "Science Timeline"
        : room.mode === "MOVIES"
          ? "Movie Timeline"
          : room.mode === "MOVIE_GUESS"
            ? "Movie Guess"
            : "Global Timeline";

  // If game is playing, show game board
  if (room.status === "playing" || room.status === "finished") {
    return <GameBoard roomId={room.id} roomCode={room.code} />;
  }

  const players = Object.values(room.players);
  const isHost = player.id === room.hostId;

  return (
    <main className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="text-muted-foreground"
        >
          <ArrowLeft size={20} className="mr-2" />
          Leave
        </Button>

        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Timeline</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full gap-8">
        {/* Room Code */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Room Code</p>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-3 px-6 py-3 bg-card rounded-xl border border-border hover:border-primary transition-colors"
          >
            <span className="text-3xl font-mono font-bold tracking-widest text-foreground">
              {room.code}
            </span>
            {copied ? (
              <Check className="w-5 h-5 text-game-success" />
            ) : (
              <Copy className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Share this code with friends
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Mode: {modeLabel}
          </p>
        </div>

        {/* Players List */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">
              Players ({players.length}/8)
            </h2>
          </div>

          <div className="space-y-3">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
              >
                <AvatarIcon avatarId={p.avatar as AvatarId} size="sm" />
                <span className="flex-1 font-medium text-foreground">
                  {p.displayName}
                </span>
                {p.id === room.hostId && (
                  <div className="flex items-center gap-1 text-accent">
                    <Crown size={16} />
                    <span className="text-xs">Host</span>
                  </div>
                )}
                {p.id === player.id && (
                  <span className="text-xs text-muted-foreground">(You)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}

        {isHost ? (
          <Button
            onClick={handleStartGame}
            disabled={isStarting || players.length < 1}
            className="w-full h-14 text-lg"
            size="lg"
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={24} />
                Starting...
              </>
            ) : (
              <>
                <Play className="mr-2" size={24} />
                Start Game
              </>
            )}
          </Button>
        ) : (
          <div className="text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Waiting for host to start the game...
          </div>
        )}
      </div>
    </main>
  );
}
