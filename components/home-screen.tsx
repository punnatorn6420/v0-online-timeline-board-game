"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarIcon } from "@/components/avatar-icon";
import { usePlayer } from "@/lib/player-context";
import type { GameMode } from "@/lib/game-types";
import { Clock, Users, Plus, ArrowRight, LogOut } from "lucide-react";

export function HomeScreen() {
  const router = useRouter();
  const { player, clearPlayer } = usePlayer();
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [gameMode, setGameMode] = useState<GameMode>("GLOBAL");

  if (!player) return null;

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player.id,
          playerName: player.displayName,
          playerAvatar: player.avatar,
          mode: gameMode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/room/${data.room.code}`);
      } else {
        setError(data.error || "Failed to create room");
      }
    } catch {
      setError("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const response = await fetch("/api/rooms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: roomCode.toUpperCase(),
          playerId: player.id,
          playerName: player.displayName,
          playerAvatar: player.avatar,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/room/${data.room.code}`);
      } else {
        setError(data.error || "Failed to join room");
      }
    } catch {
      setError("Failed to join room. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      {/* Player Info */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border w-full">
        <AvatarIcon avatarId={player.avatar} size="lg" />
        <div className="flex-1">
          <p className="text-lg font-semibold text-foreground">
            {player.displayName}
          </p>
          <p className="text-sm text-muted-foreground">Ready to play</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearPlayer}
          className="text-muted-foreground hover:text-destructive"
          title="Change character"
        >
          <LogOut size={20} />
        </Button>
      </div>

      {/* Game Logo/Title */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Clock className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Timeline</h1>
        </div>
        <p className="text-muted-foreground">
          Test your knowledge of history through the ages
        </p>
      </div>

      {/* Actions */}
      <div className="w-full space-y-4">
        <div className="space-y-3">
          <Label>Game Mode</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button
              type="button"
              variant={gameMode === "GLOBAL" ? "default" : "secondary"}
              onClick={() => setGameMode("GLOBAL")}
              className="h-12"
            >
              Global Timeline
            </Button>
            <Button
              type="button"
              variant={gameMode === "THAILAND" ? "default" : "secondary"}
              onClick={() => setGameMode("THAILAND")}
              className="h-12"
            >
              Thailand Timeline
            </Button>
            <Button
              type="button"
              variant={gameMode === "SCIENCE" ? "default" : "secondary"}
              onClick={() => setGameMode("SCIENCE")}
              className="h-12"
            >
              Science Timeline
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {gameMode === "GLOBAL"
              ? "Play the original worldwide timeline."
              : gameMode === "THAILAND"
                ? "Play with events that happened in Thailand."
                : "Play with science discoveries and technology milestones."}
          </p>
        </div>

        <Button
          onClick={handleCreateRoom}
          disabled={isCreating}
          className="w-full h-14 text-lg"
          size="lg"
        >
          <Plus className="mr-2" size={24} />
          {isCreating ? "Creating..." : "Create Room"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-4 text-muted-foreground">or</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="roomCode">Join with Room Code</Label>
          <div className="flex gap-3">
            <Input
              id="roomCode"
              type="text"
              placeholder="Enter code..."
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
              className="bg-secondary border-border uppercase tracking-widest text-center font-mono"
              maxLength={6}
            />
            <Button
              onClick={handleJoinRoom}
              disabled={isJoining || !roomCode.trim()}
              variant="secondary"
            >
              <ArrowRight size={20} />
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}
      </div>

      {/* How to Play */}
      <div className="w-full p-4 bg-secondary/50 rounded-xl">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users size={18} />
          How to Play
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>1. Create a room or join with a code</li>
          <li>2. Answer timeline questions (0-9 eras)</li>
          <li>3. Correct answers move you forward</li>
          <li>4. First to reach position 15 wins!</li>
        </ul>
      </div>
    </div>
  );
}
