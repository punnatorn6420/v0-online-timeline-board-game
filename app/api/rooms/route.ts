import { NextRequest, NextResponse } from "next/server";
import { createRoom, joinRoom, getRoomByCode } from "@/lib/game-store";

export const runtime = "nodejs";

// Create a new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, playerName, playerAvatar } = body;

    if (!playerId || !playerName || !playerAvatar) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const room = await createRoom(playerId, playerName, playerAvatar);

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        status: room.status,
        players: room.players,
      },
    });
  } catch (err) {
    console.error("[/api/rooms] POST failed:", err);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 },
    );
  }
}

// Join a room by code
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, playerId, playerName, playerAvatar } = body;

    if (!code || !playerId || !playerName || !playerAvatar) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await joinRoom(code, playerId, playerName, playerAvatar);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      room: {
        id: result.room!.id,
        code: result.room!.code,
        status: result.room!.status,
        players: result.room!.players,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}

// Get room by code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Room code required" },
        { status: 400 },
      );
    }

    const room = await getRoomByCode(code);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        status: room.status,
        players: room.players,
        hostId: room.hostId,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to get room" }, { status: 500 });
  }
}
