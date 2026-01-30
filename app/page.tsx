"use client";

import { useState, useEffect } from "react";
import { CharacterSetup } from "@/components/character-setup";
import { HomeScreen } from "@/components/home-screen";
import { usePlayer } from "@/lib/player-context";

export default function HomePage() {
  const { player, isLoading } = usePlayer();
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (!isLoading && !player) {
      setShowSetup(true);
    }
  }, [isLoading, player]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      {showSetup && !player ? (
        <CharacterSetup onComplete={() => setShowSetup(false)} />
      ) : player ? (
        <HomeScreen />
      ) : null}
    </main>
  );
}
