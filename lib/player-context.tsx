"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { AvatarId } from "./game-types";

interface PlayerData {
  id: string;
  displayName: string;
  avatar: AvatarId;
}

interface PlayerContextType {
  player: PlayerData | null;
  setPlayer: (player: PlayerData) => void;
  clearPlayer: () => void;
  isLoading: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const STORAGE_KEY = "timeline-player";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayerState] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPlayerState(parsed);
      }
    } catch {
      // Invalid stored data
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const setPlayer = (newPlayer: PlayerData) => {
    setPlayerState(newPlayer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlayer));
  };

  const clearPlayer = () => {
    setPlayerState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <PlayerContext.Provider
      value={{ player, setPlayer, clearPlayer, isLoading }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}

// Generate a unique player ID
export function generatePlayerId(): string {
  return `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
