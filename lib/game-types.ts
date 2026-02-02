// Timeline ranges 0-9 mapped to eras
export type RangeInfo = {
  name: string;
  period: string;
  description: string;
};

export const TIMELINE_RANGES: Record<number, RangeInfo> = {
  0: {
    name: "Prehistoric Age",
    period: "Before 500 BCE",
    description: "Stone age, before civilizations",
  },
  1: {
    name: "Ancient Civilizations",
    period: "500 BCE - 500 CE",
    description: "Rise of empires",
  },
  2: {
    name: "Early Middle Ages",
    period: "500 - 1000",
    description: "Dark ages, early medieval",
  },
  3: {
    name: "Late Middle Ages",
    period: "1000 - 1500",
    description: "Crusades, feudalism",
  },
  4: {
    name: "Renaissance & Exploration",
    period: "1500 - 1700",
    description: "Age of discovery",
  },
  5: {
    name: "Revolution & Industry",
    period: "1700 - 1800",
    description: "Enlightenment era",
  },
  6: {
    name: "Industrial & Nationalism",
    period: "1800 - 1900",
    description: "Industrial revolution",
  },
  7: {
    name: "World Wars Era",
    period: "1900 - 1950",
    description: "Global conflicts",
  },
  8: {
    name: "Cold War & Space Age",
    period: "1950 - 2000",
    description: "Space race, tech boom",
  },
  9: {
    name: "Digital Age",
    period: "2000 - Present",
    description: "Internet era",
  },
};

export const MOVIE_RANGE_START_YEAR = 1930;
export const MOVIE_RANGE_STEP = 5;
export const MOVIE_RANGE_COUNT = 20;

export const MOVIE_RANGES: Record<number, RangeInfo> = Object.fromEntries(
  Array.from({ length: MOVIE_RANGE_COUNT }, (_, index) => {
    const start = MOVIE_RANGE_START_YEAR + MOVIE_RANGE_STEP * index;
    const end = start + MOVIE_RANGE_STEP - 1;
    return [
      index,
      {
        name: `${start}-${end}`,
        period: `${start}-${end}`,
        description: `Movie releases from ${start} to ${end}`,
      },
    ];
  })
);

export type TimelineRange =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19;

export type GameMode =
  | "GLOBAL"
  | "THAILAND"
  | "SCIENCE"
  | "MOVIES"
  | "MOVIE_GUESS";

export type Category =
  | "HISTORY"
  | "SCI_TECH"
  | "CULTURE"
  | "TRAVEL"
  | "LANDMARKS"
  | "DISCOVERIES"
  | "POLITICS"
  | "SPORTS"
  | "NATURE"
  | "MOVIES"
  | "RANDOM";

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: Category;
  correctRange: TimelineRange;
  choices?: string[];
}

export interface GameEventClient {
  id: string;
  title: string;
  description: string;
  category: Category;
  choices?: string[];
}

export interface RoundResults {
  round: number;
  correctRange: TimelineRange;
  correctAnswerText?: string;
  answerLabels?: string[];
  players: Array<{
    id: string;
    displayName: string;
    answer: TimelineRange | null;
    correct: boolean;
    movement: number;
    newPosition: number;
  }>;
}

export type RoundType = "NORMAL" | "RISK" | "SUPPORT" | "CATEGORY";

export type TileType =
  | "NORMAL_TILE"
  | "RISK_TILE"
  | "CATEGORY_TILE"
  | "SUPPORT_TILE";

export interface BoardTile {
  position: number;
  type: TileType;
  category?: Category; // For CATEGORY_TILE
}

export type RoomStatus = "waiting" | "playing" | "finished";

export interface Player {
  id: string;
  displayName: string;
  avatar: string;
  position: number;
  isHost: boolean;
  hasSubmitted: boolean;
  currentAnswer: TimelineRange | null;
  lastAnswerCorrect: boolean | null;
}

export interface GameRoom {
  id: string;
  code: string;
  status: RoomStatus;
  hostId: string;
  mode: GameMode;
  players: Record<string, Player>;
  currentRound: number;
  currentEventId: string | null;
  currentEvent: GameEventClient | null;
  roundType: RoundType;
  boardTiles: BoardTile[];
  winnerId: string | null;
  createdAt: number;
  hint?: string | null; // For SUPPORT rounds
  forcedCategory?: Category | null; // For CATEGORY rounds
  roundResults?: RoundResults | null;
  eventHistory?: string[];
}

// Avatar options
export const AVATARS = [
  { id: "explorer", name: "Explorer", icon: "compass" },
  { id: "scholar", name: "Scholar", icon: "book-open" },
  { id: "inventor", name: "Inventor", icon: "lightbulb" },
  { id: "warrior", name: "Warrior", icon: "shield" },
  { id: "artist", name: "Artist", icon: "palette" },
  { id: "scientist", name: "Scientist", icon: "flask-conical" },
  { id: "navigator", name: "Navigator", icon: "map" },
  { id: "philosopher", name: "Philosopher", icon: "brain" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

// Board configuration
export const BOARD_SIZE = 16;
export const FINISH_POSITION = 15;
export const MOVIE_GUESS_TARGET = 5;
export const MOVIE_GUESS_BOARD_SIZE = MOVIE_GUESS_TARGET + 1;
export const DEFAULT_CATEGORIES: Category[] = [
  "HISTORY",
  "SCI_TECH",
  "CULTURE",
  "TRAVEL",
  "LANDMARKS",
  "DISCOVERIES",
  "POLITICS",
  "SPORTS",
  "NATURE",
];

// Generate default board with special tiles
export function generateBoard(
  categories: Category[] = DEFAULT_CATEGORIES,
  boardSize: number = BOARD_SIZE
): BoardTile[] {
  const tiles: BoardTile[] = [];

  for (let i = 0; i < boardSize; i++) {
    let type: TileType = "NORMAL_TILE";

    if (i === 3) type = "SUPPORT_TILE";
    else if (i === 6) type = "CATEGORY_TILE";
    else if (i === 9) type = "RISK_TILE";
    else if (i === 12) type = "SUPPORT_TILE";
    else if (i === 14) type = "CATEGORY_TILE";

    const tile: BoardTile = {
      position: i,
      type,
    };

    if (type === "CATEGORY_TILE") {
      tile.category = getRandomCategory(categories);
    }

    tiles.push(tile);
  }

  return tiles;
}

function getRandomCategory(categories: Category[]): Category {
  return categories[Math.floor(Math.random() * categories.length)];
}

export function getRangesForMode(mode: GameMode): Record<number, RangeInfo> {
  return mode === "MOVIES" ? MOVIE_RANGES : TIMELINE_RANGES;
}

export function getBoardSize(mode: GameMode): number {
  return mode === "MOVIE_GUESS" ? MOVIE_GUESS_BOARD_SIZE : BOARD_SIZE;
}

export function getFinishPosition(mode: GameMode): number {
  return mode === "MOVIE_GUESS" ? MOVIE_GUESS_TARGET : FINISH_POSITION;
}

export function getMovieRangeIndex(year: number): TimelineRange {
  const index = Math.floor((year - MOVIE_RANGE_START_YEAR) / MOVIE_RANGE_STEP);
  const clamped = Math.min(Math.max(index, 0), MOVIE_RANGE_COUNT - 1);
  return clamped as TimelineRange;
}

// Round type effects
export const ROUND_EFFECTS = {
  NORMAL: {
    correctMove: 1,
    incorrectMove: 0,
    description: "Answer correctly to move +1",
  },
  RISK: {
    correctMove: 2,
    incorrectMove: -1,
    description: "High stakes! +2 if correct, -1 if wrong",
  },
  SUPPORT: {
    correctMove: 1,
    incorrectMove: 0,
    description: "Hint provided! +1 if correct",
  },
  CATEGORY: {
    correctMove: 1,
    incorrectMove: 0,
    description: "Category locked! +1 if correct",
  },
} as const;

// Generate room code
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
