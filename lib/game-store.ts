import type {
  GameRoom,
  Player,
  RoundType,
  TimelineRange,
  Category,
  GameMode,
} from "./game-types";
import {
  generateRoomCode,
  generateBoard,
  ROUND_EFFECTS,
  FINISH_POSITION,
} from "./game-types";
import {
  getEventsForMode,
  getRandomEvent,
  getEventById,
  getEventForClient,
  generateHint,
  getCategoriesForMode,
} from "./events";
import { adminDb } from "./firebase-admin";

const roomsCollection = adminDb.collection("rooms");

async function generateUniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const snapshot = await roomsCollection.where("code", "==", code).limit(1).get();
    if (snapshot.empty) {
      return code;
    }
  }
  throw new Error("Failed to generate a unique room code");
}

export async function createRoom(
  hostId: string,
  hostName: string,
  hostAvatar: string,
  mode: GameMode
): Promise<GameRoom> {
  const roomId = roomsCollection.doc().id;
  const code = await generateUniqueRoomCode();

  const host: Player = {
    id: hostId,
    displayName: hostName,
    avatar: hostAvatar,
    position: 0,
    isHost: true,
    hasSubmitted: false,
    currentAnswer: null,
    lastAnswerCorrect: null,
  };

  const room: GameRoom = {
    id: roomId,
    code,
    status: "waiting",
    hostId,
    mode,
    players: { [hostId]: host },
    currentRound: 0,
    currentEventId: null,
    currentEvent: null,
    roundType: "NORMAL",
    boardTiles: generateBoard(getCategoriesForMode(mode)),
    winnerId: null,
    roundResults: null,
    eventHistory: [],
    createdAt: Date.now(),
  };

  await roomsCollection.doc(roomId).set(room);

  return room;
}

export async function joinRoom(
  code: string,
  playerId: string,
  playerName: string,
  playerAvatar: string
): Promise<{ success: boolean; room?: GameRoom; error?: string }> {
  const snapshot = await roomsCollection
    .where("code", "==", code.toUpperCase())
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { success: false, error: "Room not found" };
  }

  const roomRef = snapshot.docs[0].ref;

  return adminDb.runTransaction(async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists) {
      return { success: false, error: "Room not found" };
    }

    const room = roomSnap.data() as GameRoom;

    if (room.status !== "waiting") {
      return { success: false, error: "Game already in progress" };
    }

    if (Object.keys(room.players).length >= 8) {
      return { success: false, error: "Room is full" };
    }

    if (room.players[playerId]) {
      return { success: true, room };
    }

    const player: Player = {
      id: playerId,
      displayName: playerName,
      avatar: playerAvatar,
      position: 0,
      isHost: false,
      hasSubmitted: false,
      currentAnswer: null,
      lastAnswerCorrect: null,
    };

    const updatedRoom: GameRoom = {
      ...room,
      players: {
        ...room.players,
        [playerId]: player,
      },
    };

    transaction.update(roomRef, { players: updatedRoom.players });

    return { success: true, room: updatedRoom };
  });
}

export async function getRoom(roomId: string): Promise<GameRoom | undefined> {
  const docSnap = await roomsCollection.doc(roomId).get();
  if (!docSnap.exists) return undefined;
  return docSnap.data() as GameRoom;
}

export async function getRoomByCode(code: string): Promise<GameRoom | undefined> {
  const snapshot = await roomsCollection
    .where("code", "==", code.toUpperCase())
    .limit(1)
    .get();

  if (snapshot.empty) return undefined;
  return snapshot.docs[0].data() as GameRoom;
}

export async function startGame(
  roomId: string,
  playerId: string
): Promise<{ success: boolean; error?: string }> {
  const roomRef = roomsCollection.doc(roomId);

  return adminDb.runTransaction(async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists) {
      return { success: false, error: "Room not found" };
    }

    const room = roomSnap.data() as GameRoom;

    if (room.hostId !== playerId) {
      return { success: false, error: "Only the host can start the game" };
    }

    if (Object.keys(room.players).length < 1) {
      return { success: false, error: "Need at least 1 player to start" };
    }

    const roundUpdate = startNewRound(room);

    const updatedRoom: GameRoom = {
      ...room,
      status: "playing",
      currentRound: 1,
      ...roundUpdate,
    };

    transaction.update(roomRef, updatedRoom);

    return { success: true };
  });
}

function determineRoundType(
  room: GameRoom
): { roundType: RoundType; category?: Category } {
  const specialEffects: { type: RoundType; category?: Category }[] = [];

  for (const player of Object.values(room.players)) {
    const tile = room.boardTiles[player.position];
    if (!tile) continue;

    switch (tile.type) {
      case "RISK_TILE":
        specialEffects.push({ type: "RISK" });
        break;
      case "CATEGORY_TILE":
        specialEffects.push({ type: "CATEGORY", category: tile.category });
        break;
      case "SUPPORT_TILE":
        specialEffects.push({ type: "SUPPORT" });
        break;
      default:
        break;
    }
  }

  if (specialEffects.some((effect) => effect.type === "RISK")) {
    return { roundType: "RISK" };
  }

  if (specialEffects.some((effect) => effect.type === "CATEGORY")) {
    const categoryEffect = specialEffects.find(
      (effect) => effect.type === "CATEGORY"
    );
    return { roundType: "CATEGORY", category: categoryEffect?.category };
  }

  if (specialEffects.some((effect) => effect.type === "SUPPORT")) {
    return { roundType: "SUPPORT" };
  }

  const types: RoundType[] = [
    "NORMAL",
    "NORMAL",
    "NORMAL",
    "RISK",
    "SUPPORT",
    "CATEGORY",
  ];
  return { roundType: types[Math.floor(Math.random() * types.length)] };
}

function resetPlayers(players: Record<string, Player>): Record<string, Player> {
  return Object.fromEntries(
    Object.entries(players).map(([playerId, player]) => [
      playerId,
      {
        ...player,
        hasSubmitted: false,
        currentAnswer: null,
        lastAnswerCorrect: null,
      },
    ])
  );
}

function startNewRound(room: GameRoom): Partial<GameRoom> {
  const { roundType, category } = determineRoundType(room);
  const mode = room.mode ?? "GLOBAL";
  const eventsForMode = getEventsForMode(mode);
  const history = room.eventHistory ?? [];
  const availableHistory = history.length >= eventsForMode.length ? [] : history;
  const event = getRandomEvent(
    roundType === "CATEGORY" && category ? category : undefined,
    availableHistory,
    mode
  );
  const clientEvent = getEventForClient(event.id, mode);
  const nextHistory = availableHistory.includes(event.id)
    ? availableHistory
    : [...availableHistory, event.id];

  return {
    players: resetPlayers(room.players),
    roundType,
    forcedCategory: roundType === "CATEGORY" ? category ?? null : null,
    currentEventId: event.id,
    currentEvent: clientEvent ?? null,
    hint: roundType === "SUPPORT" ? generateHint(event.correctRange) : null,
    eventHistory: nextHistory,
  };
}

export async function submitAnswer(
  roomId: string,
  playerId: string,
  answer: TimelineRange
): Promise<{ success: boolean; error?: string; allSubmitted?: boolean }>
{
  const roomRef = roomsCollection.doc(roomId);

  return adminDb.runTransaction(async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists) {
      return { success: false, error: "Room not found" };
    }

    const room = roomSnap.data() as GameRoom;

    if (room.status !== "playing") {
      return { success: false, error: "Game is not in progress" };
    }

    const player = room.players[playerId];
    if (!player) {
      return { success: false, error: "Player not in room" };
    }

    if (player.hasSubmitted) {
      return { success: false, error: "Already submitted" };
    }

    const updatedPlayers: Record<string, Player> = {
      ...room.players,
      [playerId]: {
        ...player,
        currentAnswer: answer,
        hasSubmitted: true,
      },
    };

    const allSubmitted = Object.values(updatedPlayers).every(
      (p) => p.hasSubmitted
    );

    transaction.update(roomRef, { players: updatedPlayers });

    return { success: true, allSubmitted };
  });
}

export async function revealAndProcessRound(roomId: string): Promise<{
  success: boolean;
  error?: string;
  results?: {
    correctRange: TimelineRange;
    players: Array<{
      id: string;
      displayName: string;
      answer: TimelineRange | null;
      correct: boolean;
      movement: number;
      newPosition: number;
    }>;
  };
  winnerId?: string;
  gameFinished?: boolean;
}> {
  const roomRef = roomsCollection.doc(roomId);

  return adminDb.runTransaction(async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists) {
      return { success: false, error: "Room not found" };
    }

    const room = roomSnap.data() as GameRoom;

    if (!room.currentEventId) {
      return { success: false, error: "No event in progress" };
    }

    const event = getEventById(room.currentEventId, room.mode ?? "GLOBAL");
    if (!event) {
      return { success: false, error: "Event not found" };
    }

    const effects = ROUND_EFFECTS[room.roundType];
    const results: Array<{
      id: string;
      displayName: string;
      answer: TimelineRange | null;
      correct: boolean;
      movement: number;
      newPosition: number;
    }> = [];

    let winnerId: string | null = null;

    const updatedPlayers: Record<string, Player> = {};

    for (const player of Object.values(room.players)) {
      const correct = player.currentAnswer === event.correctRange;
      const movement = correct ? effects.correctMove : effects.incorrectMove;
      const newPosition = Math.max(
        0,
        Math.min(FINISH_POSITION, player.position + movement)
      );

      updatedPlayers[player.id] = {
        ...player,
        lastAnswerCorrect: correct,
        position: newPosition,
      };

      results.push({
        id: player.id,
        displayName: player.displayName,
        answer: player.currentAnswer,
        correct,
        movement,
        newPosition,
      });

      if (newPosition >= FINISH_POSITION && !winnerId) {
        winnerId = player.id;
      }
    }

    let updatedRoom: GameRoom = {
      ...room,
      players: updatedPlayers,
      winnerId,
      status: winnerId ? "finished" : room.status,
      roundResults: {
        round: room.currentRound,
        correctRange: event.correctRange,
        players: results,
      },
    };

    if (!winnerId) {
      const nextRound = startNewRound({
        ...room,
        players: updatedPlayers,
      });

      updatedRoom = {
        ...updatedRoom,
        currentRound: room.currentRound + 1,
        ...nextRound,
      };
    }

    transaction.update(roomRef, updatedRoom);

    return {
      success: true,
      results: {
        correctRange: event.correctRange,
        players: results,
      },
      winnerId: winnerId ?? undefined,
      gameFinished: Boolean(winnerId),
    };
  });
}

export async function getSubmissionStatus(roomId: string): Promise<{
  total: number;
  submitted: number;
  allSubmitted: boolean;
}> {
  const room = await getRoom(roomId);

  if (!room) {
    return { total: 0, submitted: 0, allSubmitted: false };
  }

  const players = Object.values(room.players);
  const submitted = players.filter((p) => p.hasSubmitted).length;

  return {
    total: players.length,
    submitted,
    allSubmitted: submitted === players.length,
  };
}

export async function leaveRoom(roomId: string, playerId: string): Promise<void> {
  const roomRef = roomsCollection.doc(roomId);

  await adminDb.runTransaction(async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists) return;

    const room = roomSnap.data() as GameRoom;
    const updatedPlayers = { ...room.players };
    delete updatedPlayers[playerId];

    if (Object.keys(updatedPlayers).length === 0) {
      transaction.delete(roomRef);
      return;
    }

    const updatedRoom: Partial<GameRoom> = {
      players: updatedPlayers,
    };

    if (room.hostId === playerId) {
      const newHost = Object.values(updatedPlayers)[0];
      if (newHost) {
        updatedPlayers[newHost.id] = {
          ...newHost,
          isHost: true,
        };
        updatedRoom.hostId = newHost.id;
      }
    }

    transaction.update(roomRef, updatedRoom);
  });
}

export async function cleanupOldRooms(): Promise<void> {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000;

  const snapshot = await roomsCollection.get();
  const batch = adminDb.batch();

  snapshot.forEach((doc) => {
    const room = doc.data() as GameRoom;
    if (now - room.createdAt > maxAge) {
      batch.delete(doc.ref);
    }
  });

  await batch.commit();
}
