"use client";

import { AvatarIcon } from "@/components/avatar-icon";
import type { BoardTile, Player, AvatarId, TileType } from "@/lib/game-types";
import { cn } from "@/lib/utils";
import { Flag, AlertTriangle, HelpCircle, Tag } from "lucide-react";

interface BoardTrackProps {
  tiles: BoardTile[];
  players: Player[];
  currentPlayerId: string;
}

const tileIcons: Record<TileType, typeof Flag | null> = {
  NORMAL_TILE: null,
  RISK_TILE: AlertTriangle,
  SUPPORT_TILE: HelpCircle,
  CATEGORY_TILE: Tag,
};

const tileColors: Record<TileType, string> = {
  NORMAL_TILE: "bg-tile-normal border-border",
  RISK_TILE: "bg-game-risk/20 border-game-risk",
  SUPPORT_TILE: "bg-game-support/20 border-game-support",
  CATEGORY_TILE: "bg-game-category/20 border-game-category",
};

export function BoardTrack({ tiles, players, currentPlayerId }: BoardTrackProps) {
  const lastTileIndex = tiles.length - 1;

  // Group players by position
  const playersByPosition: Record<number, Player[]> = {};
  for (const player of players) {
    if (!playersByPosition[player.position]) {
      playersByPosition[player.position] = [];
    }
    playersByPosition[player.position].push(player);
  }

  return (
    <div className="flex gap-2 items-center min-w-max">
      {tiles.map((tile, index) => {
        const Icon = tileIcons[tile.type];
        const isFinish = index === lastTileIndex;
        const playersOnTile = playersByPosition[tile.position] || [];

        return (
          <div
            key={tile.position}
            className={cn(
              "relative flex flex-col items-center justify-center",
              "w-14 h-14 rounded-xl border-2 transition-all shadow-sm",
              tileColors[tile.type],
              isFinish &&
                "ring-2 ring-game-success ring-offset-2 ring-offset-background animate-pulse"
            )}
          >
            {/* Tile number or icon */}
            {isFinish ? (
              <Flag className="w-5 h-5 text-game-success" />
            ) : Icon ? (
              <Icon className="w-5 h-5 opacity-70" />
            ) : (
              <span className="text-xs text-muted-foreground">{tile.position}</span>
            )}

            {/* Players on this tile */}
            {playersOnTile.length > 0 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex -space-x-2">
                {playersOnTile.slice(0, 3).map((player) => (
                  <div
                    key={player.id}
                    className={cn(
                      "rounded-full ring-2 ring-background",
                      player.id === currentPlayerId && "ring-primary motion-safe:animate-bounce"
                    )}
                  >
                    <AvatarIcon
                      avatarId={player.avatar as AvatarId}
                      size="sm"
                      className="w-7 h-7 p-1"
                    />
                  </div>
                ))}
                {playersOnTile.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs ring-2 ring-background">
                    +{playersOnTile.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
