import { NextRequest, NextResponse } from "next/server";
import {
  getRoom,
  startGame,
  submitAnswer,
  revealAndProcessRound,
  getSubmissionStatus,
} from "@/lib/game-store";
import { getEventForClient } from "@/lib/events";
import type { TimelineRange } from "@/lib/game-types";

// Get game state
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID required" },
        { status: 400 }
      );
    }

    const room = getRoom(roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Get current event (without correctRange)
    const event = room.currentEventId
      ? getEventForClient(room.currentEventId)
      : null;

    // Get submission status
    const submissionStatus = getSubmissionStatus(roomId);

    return NextResponse.json({
      success: true,
      game: {
        id: room.id,
        code: room.code,
        status: room.status,
        players: room.players,
        hostId: room.hostId,
        currentRound: room.currentRound,
        roundType: room.roundType,
        boardTiles: room.boardTiles,
        winnerId: room.winnerId,
        hint: room.hint,
        forcedCategory: room.forcedCategory,
        event,
        submissionStatus,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get game state" },
      { status: 500 }
    );
  }
}

// Game actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomId, playerId, answer } = body;

    if (!action || !roomId || !playerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const room = getRoom(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    switch (action) {
      case "start": {
        const result = startGame(roomId, playerId);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Get updated room state
        const updatedRoom = getRoom(roomId);
        const event = updatedRoom?.currentEventId
          ? getEventForClient(updatedRoom.currentEventId)
          : null;

        return NextResponse.json({
          success: true,
          game: {
            id: updatedRoom!.id,
            status: updatedRoom!.status,
            currentRound: updatedRoom!.currentRound,
            roundType: updatedRoom!.roundType,
            hint: updatedRoom!.hint,
            forcedCategory: updatedRoom!.forcedCategory,
            event,
            players: updatedRoom!.players,
            boardTiles: updatedRoom!.boardTiles,
          },
        });
      }

      case "submit": {
        if (answer === undefined || answer === null) {
          return NextResponse.json(
            { error: "Answer required" },
            { status: 400 }
          );
        }

        const result = submitAnswer(roomId, playerId, answer as TimelineRange);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }

        const submissionStatus = getSubmissionStatus(roomId);

        return NextResponse.json({
          success: true,
          allSubmitted: result.allSubmitted,
          submissionStatus,
        });
      }

      case "reveal": {
        const result = revealAndProcessRound(roomId);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Get updated room state for next round
        const updatedRoom = getRoom(roomId);
        const nextEvent = updatedRoom?.currentEventId
          ? getEventForClient(updatedRoom.currentEventId)
          : null;

        return NextResponse.json({
          success: true,
          results: result.results,
          winnerId: result.winnerId,
          gameFinished: result.gameFinished,
          nextRound: result.gameFinished
            ? null
            : {
                round: updatedRoom!.currentRound,
                roundType: updatedRoom!.roundType,
                hint: updatedRoom!.hint,
                forcedCategory: updatedRoom!.forcedCategory,
                event: nextEvent,
              },
          players: updatedRoom!.players,
          boardTiles: updatedRoom!.boardTiles,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
