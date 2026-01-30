"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarIcon } from "@/components/avatar-icon";
import { AVATARS, type AvatarId } from "@/lib/game-types";
import { usePlayer, generatePlayerId } from "@/lib/player-context";
import { cn } from "@/lib/utils";

interface CharacterSetupProps {
  onComplete: () => void;
}

export function CharacterSetup({ onComplete }: CharacterSetupProps) {
  const { setPlayer } = usePlayer();
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>("explorer");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setError("Please enter a display name");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (trimmedName.length > 20) {
      setError("Name must be less than 20 characters");
      return;
    }

    setPlayer({
      id: generatePlayerId(),
      displayName: trimmedName,
      avatar: selectedAvatar,
    });

    onComplete();
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Create Your Character</h2>
        <p className="text-muted-foreground mt-2">
          Choose a name and avatar to start playing
        </p>
      </div>

      <div className="w-full space-y-6">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Enter your name..."
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="bg-secondary border-border"
            maxLength={20}
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <div className="space-y-3">
          <Label>Choose Avatar</Label>
          <div className="grid grid-cols-4 gap-3">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setSelectedAvatar(avatar.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
                  "hover:bg-secondary/80",
                  selectedAvatar === avatar.id
                    ? "bg-secondary ring-2 ring-primary"
                    : "bg-secondary/50"
                )}
              >
                <AvatarIcon avatarId={avatar.id} size="md" />
                <span className="text-xs text-muted-foreground">
                  {avatar.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full"
        size="lg"
      >
        Continue
      </Button>
    </div>
  );
}
