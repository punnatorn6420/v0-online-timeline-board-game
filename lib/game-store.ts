// In-memory game store (for demo purposes - in production use Firebase Firestore)
// This simulates real-time state management

import type { 
  GameRoom, 
  Player, 
  RoomStatus, 
  RoundType, 
  TimelineRange,
  TileType,
  Category
} from "./game-types";
import { 
  generateRoomCode, 
  generateBoard, 
  ROUND_EFFECTS, 
  FINISH_POSITION 
} from "./game-types";
import { getRandomEvent, getEventById, generateHint } from "./events";

// In-memory storage
const rooms: Map<string, GameRoom> = new Map();
const roomsByCode: Map<string, string> = new Map(); // code -> roomId

// Create a new room
export function createRoom(hostId: string, hostName: string, hostAvatar: string): GameRoom {
  const roomId = crypto.randomUUID();
  const code = generateRoomCode();
  
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
    players: { [hostId]: host },
    currentRound: 0,
    currentEventId: null,
    roundType: "NORMAL",
    boardTiles: generateBoard(),
    winnerId: null,
    createdAt: Date.now(),
  };
  
  rooms.set(roomId, room);
  roomsByCode.set(code, roomId);
  
  return room;
}

// Join a room by code
export function joinRoom(
  code: string, 
  playerId: string, 
  playerName: string, 
  playerAvatar: string
): { success: boolean; room?: GameRoom; error?: string } {
  const roomId = roomsByCode.get(code.toUpperCase());
  
  if (!roomId) {
    return { success: false, error: "Room not found" };
  }
  
  const room = rooms.get(roomId);
  if (!room) {
    return { success: false, error: "Room not found" };
  }
  
  if (room.status !== "waiting") {
    return { success: false, error: "Game already in progress" };
  }
  
  if (Object.keys(room.players).length >= 8) {
    return { success: false, error: "Room is full" };
  }
  
  // Check if player already in room
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
  
  room.players[playerId] = player;
  
  return { success: true, room };
}

// Get room by ID
export function getRoom(roomId: string): GameRoom | undefined {
  return rooms.get(roomId);
}

// Get room by code
export function getRoomByCode(code: string): GameRoom | undefined {
  const roomId = roomsByCode.get(code.toUpperCase());
  if (!roomId) return undefined;
  return rooms.get(roomId);
}

// Start the game
export function startGame(roomId: string, playerId: string): { success: boolean; error?: string } {
  const room = rooms.get(roomId);
  
  if (!room) {
    return { success: false, error: "Room not found" };
  }
  
  if (room.hostId !== playerId) {
    return { success: false, error: "Only the host can start the game" };
  }
  
  if (Object.keys(room.players).length < 1) {
    return { success: false, error: "Need at least 1 player to start" };
  }
  
  room.status = "playing";
  room.currentRound = 1;
  
  // Start first round
  startNewRound(room);
  
  return { success: true };
}

// Determine round type based on board tiles and random selection
function determineRoundType(room: GameRoom): { roundType: RoundType; category?: Category } {
  // Check if any player is on a special tile
  const specialEffects: { type: RoundType; category?: Category }[] = [];
  
  for (const player of Object.values(room.players)) {
    const tile = room.boardTiles[player.position];
    if (tile) {
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
      }
    }
  }
  
  // Priority: RISK > CATEGORY > SUPPORT > NORMAL
  if (specialEffects.some(e => e.type === "RISK")) {
    return { roundType: "RISK" };
  }
  if (specialEffects.some(e => e.type === "CATEGORY")) {
    const categoryEffect = specialEffects.find(e => e.type === "CATEGORY");
    return { roundType: "CATEGORY", category: categoryEffect?.category };
  }
  if (specialEffects.some(e => e.type === "SUPPORT")) {
    return { roundType: "SUPPORT" };
  }
  
  // Random selection if no special tiles
  const types: RoundType[] = ["NORMAL", "NORMAL", "NORMAL", "RISK", "SUPPORT", "CATEGORY"];
  return { roundType: types[Math.floor(Math.random() * types.length)] };
}

// Start a new round
function startNewRound(room: GameRoom): void {
  // Reset player submissions
  for (const player of Object.values(room.players)) {
    player.hasSubmitted = false;
    player.currentAnswer = null;
    player.lastAnswerCorrect = null;
  }
  
  // Determine round type
  const { roundType, category } = determineRoundType(room);
  room.roundType = roundType;
  room.forcedCategory = category;
  
  // Get random event
  const event = getRandomEvent(
    roundType === "CATEGORY" && category ? category : undefined
  );
  room.currentEventId = event.id;
  
  // Generate hint for SUPPORT rounds
  if (roundType === "SUPPORT") {
    room.hint = generateHint(event.correctRange);
  } else {
    room.hint = undefined;
  }
}

// Submit answer
export function submitAnswer(
  roomId: string, 
  playerId: string, 
  answer: TimelineRange
): { success: boolean; error?: string; allSubmitted?: boolean } {
  const room = rooms.get(roomId);
  
  if (!room) {
    return { success: false, error: "Room not found" };
  }
  
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
  
  player.currentAnswer = answer;
  player.hasSubmitted = true;
  
  // Check if all players have submitted
  const allSubmitted = Object.values(room.players).every(p => p.hasSubmitted);
  
  return { success: true, allSubmitted };
}

// Reveal answers and process round
export function revealAndProcessRound(roomId: string): {
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
} {
  const room = rooms.get(roomId);
  
  if (!room) {
    return { success: false, error: "Room not found" };
  }
  
  if (!room.currentEventId) {
    return { success: false, error: "No event in progress" };
  }
  
  const event = getEventById(room.currentEventId);
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
  
  // Process each player
  for (const player of Object.values(room.players)) {
    const correct = player.currentAnswer === event.correctRange;
    const movement = correct ? effects.correctMove : effects.incorrectMove;
    
    player.lastAnswerCorrect = correct;
    player.position = Math.max(0, Math.min(FINISH_POSITION, player.position + movement));
    
    results.push({
      id: player.id,
      displayName: player.displayName,
      answer: player.currentAnswer,
      correct,
      movement,
      newPosition: player.position,
    });
    
    // Check for winner
    if (player.position >= FINISH_POSITION) {
      room.winnerId = player.id;
      room.status = "finished";
    }
  }
  
  // If no winner, prepare next round
  if (!room.winnerId) {
    room.currentRound++;
    startNewRound(room);
  }
  
  return {
    success: true,
    results: {
      correctRange: event.correctRange,
      players: results,
    },
    winnerId: room.winnerId ?? undefined,
    gameFinished: room.status === "finished",
  };
}

// Check submission status
export function getSubmissionStatus(roomId: string): {
  total: number;
  submitted: number;
  allSubmitted: boolean;
} {
  const room = rooms.get(roomId);
  
  if (!room) {
    return { total: 0, submitted: 0, allSubmitted: false };
  }
  
  const players = Object.values(room.players);
  const submitted = players.filter(p => p.hasSubmitted).length;
  
  return {
    total: players.length,
    submitted,
    allSubmitted: submitted === players.length,
  };
}

// Leave room
export function leaveRoom(roomId: string, playerId: string): void {
  const room = rooms.get(roomId);
  if (!room) return;
  
  delete room.players[playerId];
  
  // If room is empty, delete it
  if (Object.keys(room.players).length === 0) {
    roomsByCode.delete(room.code);
    rooms.delete(roomId);
    return;
  }
  
  // If host left, assign new host
  if (room.hostId === playerId) {
    const newHost = Object.values(room.players)[0];
    if (newHost) {
      newHost.isHost = true;
      room.hostId = newHost.id;
    }
  }
}

// Clean up old rooms (call periodically)
export function cleanupOldRooms(): void {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [roomId, room] of rooms) {
    if (now - room.createdAt > maxAge) {
      roomsByCode.delete(room.code);
      rooms.delete(roomId);
    }
  }
}
