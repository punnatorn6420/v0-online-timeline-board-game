import type { GameEvent, TimelineRange, Category } from "./game-types";

export const GAME_EVENTS: GameEvent[] = [
  // HISTORY events
  {
    id: "hist-001",
    title: "Construction of the Great Pyramid of Giza",
    description: "The largest of the Egyptian pyramids was built as a tomb for Pharaoh Khufu",
    category: "HISTORY",
    correctRange: 0,
  },
  {
    id: "hist-002",
    title: "Fall of the Roman Empire",
    description: "The Western Roman Empire officially came to an end",
    category: "HISTORY",
    correctRange: 1,
  },
  {
    id: "hist-003",
    title: "The Crusades Begin",
    description: "Pope Urban II called for the First Crusade at the Council of Clermont",
    category: "HISTORY",
    correctRange: 3,
  },
  {
    id: "hist-004",
    title: "Columbus Reaches the Americas",
    description: "Christopher Columbus made his first voyage across the Atlantic Ocean",
    category: "HISTORY",
    correctRange: 4,
  },
  {
    id: "hist-005",
    title: "French Revolution",
    description: "The storming of the Bastille marked the beginning of the French Revolution",
    category: "HISTORY",
    correctRange: 5,
  },
  {
    id: "hist-006",
    title: "American Civil War",
    description: "The conflict between the Union and the Confederacy tore America apart",
    category: "HISTORY",
    correctRange: 6,
  },
  {
    id: "hist-007",
    title: "World War I",
    description: "The Great War began, eventually involving most of the world's great powers",
    category: "HISTORY",
    correctRange: 7,
  },
  {
    id: "hist-008",
    title: "Berlin Wall Falls",
    description: "The wall dividing East and West Berlin was torn down",
    category: "HISTORY",
    correctRange: 8,
  },
  {
    id: "hist-009",
    title: "9/11 Attacks",
    description: "Terrorist attacks on the World Trade Center changed the world",
    category: "HISTORY",
    correctRange: 9,
  },
  {
    id: "hist-010",
    title: "Viking Age Begins",
    description: "Norse seafarers began their expansion across Europe",
    category: "HISTORY",
    correctRange: 2,
  },

  // SCI_TECH events
  {
    id: "tech-001",
    title: "Invention of the Wheel",
    description: "One of humanity's most important inventions revolutionized transportation",
    category: "SCI_TECH",
    correctRange: 0,
  },
  {
    id: "tech-002",
    title: "Gutenberg Printing Press",
    description: "Johannes Gutenberg invented the movable type printing press",
    category: "SCI_TECH",
    correctRange: 4,
  },
  {
    id: "tech-003",
    title: "Newton's Principia Published",
    description: "Isaac Newton published his laws of motion and universal gravitation",
    category: "SCI_TECH",
    correctRange: 5,
  },
  {
    id: "tech-004",
    title: "First Steam Engine",
    description: "James Watt improved the steam engine, powering the Industrial Revolution",
    category: "SCI_TECH",
    correctRange: 5,
  },
  {
    id: "tech-005",
    title: "Telephone Invented",
    description: "Alexander Graham Bell patented the telephone",
    category: "SCI_TECH",
    correctRange: 6,
  },
  {
    id: "tech-006",
    title: "First Airplane Flight",
    description: "The Wright Brothers achieved the first powered flight at Kitty Hawk",
    category: "SCI_TECH",
    correctRange: 7,
  },
  {
    id: "tech-007",
    title: "First Computer (ENIAC)",
    description: "The first general-purpose electronic computer was completed",
    category: "SCI_TECH",
    correctRange: 7,
  },
  {
    id: "tech-008",
    title: "Moon Landing",
    description: "Neil Armstrong became the first human to walk on the Moon",
    category: "SCI_TECH",
    correctRange: 8,
  },
  {
    id: "tech-009",
    title: "World Wide Web Created",
    description: "Tim Berners-Lee invented the World Wide Web",
    category: "SCI_TECH",
    correctRange: 8,
  },
  {
    id: "tech-010",
    title: "iPhone Released",
    description: "Apple released the first iPhone, revolutionizing smartphones",
    category: "SCI_TECH",
    correctRange: 9,
  },

  // CULTURE events
  {
    id: "cult-001",
    title: "Mona Lisa Painted",
    description: "Leonardo da Vinci created his famous masterpiece",
    category: "CULTURE",
    correctRange: 4,
  },
  {
    id: "cult-002",
    title: "Shakespeare's Hamlet",
    description: "William Shakespeare wrote one of his most famous tragedies",
    category: "CULTURE",
    correctRange: 4,
  },
  {
    id: "cult-003",
    title: "Beethoven's 9th Symphony",
    description: "Ludwig van Beethoven premiered his final complete symphony",
    category: "CULTURE",
    correctRange: 6,
  },
  {
    id: "cult-004",
    title: "First Motion Picture",
    description: "The Lumière Brothers held the first public film screening",
    category: "CULTURE",
    correctRange: 6,
  },
  {
    id: "cult-005",
    title: "Jazz Age Begins",
    description: "Jazz music exploded in popularity during the Roaring Twenties",
    category: "CULTURE",
    correctRange: 7,
  },
  {
    id: "cult-006",
    title: "Beatles' British Invasion",
    description: "The Beatles appeared on The Ed Sullivan Show, taking America by storm",
    category: "CULTURE",
    correctRange: 8,
  },
  {
    id: "cult-007",
    title: "First Video Game Console",
    description: "The Magnavox Odyssey became the first home video game console",
    category: "CULTURE",
    correctRange: 8,
  },
  {
    id: "cult-008",
    title: "Harry Potter Published",
    description: "J.K. Rowling published the first Harry Potter book",
    category: "CULTURE",
    correctRange: 8,
  },
  {
    id: "cult-009",
    title: "YouTube Founded",
    description: "The video-sharing platform that changed media was founded",
    category: "CULTURE",
    correctRange: 9,
  },
  {
    id: "cult-010",
    title: "TikTok Goes Global",
    description: "The short-form video app became a worldwide phenomenon",
    category: "CULTURE",
    correctRange: 9,
  },

  // TRAVEL events
  {
    id: "trav-001",
    title: "Silk Road Established",
    description: "Ancient trade routes connected East and West",
    category: "TRAVEL",
    correctRange: 1,
  },
  {
    id: "trav-002",
    title: "Marco Polo's Journey",
    description: "The Venetian explorer traveled to China and back",
    category: "TRAVEL",
    correctRange: 3,
  },
  {
    id: "trav-003",
    title: "Magellan's Circumnavigation",
    description: "The first expedition to sail around the entire Earth",
    category: "TRAVEL",
    correctRange: 4,
  },
  {
    id: "trav-004",
    title: "First Hot Air Balloon",
    description: "The Montgolfier Brothers demonstrated the first hot air balloon",
    category: "TRAVEL",
    correctRange: 5,
  },
  {
    id: "trav-005",
    title: "Transcontinental Railroad",
    description: "The first railroad connecting the US East and West coasts was completed",
    category: "TRAVEL",
    correctRange: 6,
  },
  {
    id: "trav-006",
    title: "Titanic Sinks",
    description: "The 'unsinkable' ship hit an iceberg on its maiden voyage",
    category: "TRAVEL",
    correctRange: 7,
  },
  {
    id: "trav-007",
    title: "First Commercial Airline",
    description: "The first scheduled commercial airline service began",
    category: "TRAVEL",
    correctRange: 7,
  },
  {
    id: "trav-008",
    title: "Concorde's First Flight",
    description: "The supersonic passenger airliner took its maiden voyage",
    category: "TRAVEL",
    correctRange: 8,
  },
  {
    id: "trav-009",
    title: "International Space Station",
    description: "The first module of the ISS was launched into orbit",
    category: "TRAVEL",
    correctRange: 8,
  },
  {
    id: "trav-010",
    title: "SpaceX Crew Dragon",
    description: "The first private spacecraft to carry astronauts to the ISS",
    category: "TRAVEL",
    correctRange: 9,
  },
];

// Get events by category
export function getEventsByCategory(category: Category): GameEvent[] {
  if (category === "RANDOM") {
    return GAME_EVENTS;
  }
  return GAME_EVENTS.filter((event) => event.category === category);
}

// Get random event
export function getRandomEvent(category?: Category, excludeIds?: string[]): GameEvent {
  let events = category && category !== "RANDOM" 
    ? getEventsByCategory(category) 
    : GAME_EVENTS;
  
  if (excludeIds && excludeIds.length > 0) {
    events = events.filter((e) => !excludeIds.includes(e.id));
  }
  
  if (events.length === 0) {
    events = GAME_EVENTS;
  }
  
  return events[Math.floor(Math.random() * events.length)];
}

// Get event by ID (server-side only - includes correctRange)
export function getEventById(id: string): GameEvent | undefined {
  return GAME_EVENTS.find((event) => event.id === id);
}

// Get event for client (excludes correctRange)
export function getEventForClient(id: string): Omit<GameEvent, "correctRange"> | undefined {
  const event = getEventById(id);
  if (!event) return undefined;
  
  const { correctRange, ...clientEvent } = event;
  return clientEvent;
}

// Generate hint for SUPPORT rounds
export function generateHint(correctRange: TimelineRange): string {
  const minHint = Math.max(0, correctRange - 1);
  const maxHint = Math.min(9, correctRange + 1);
  return `The answer is somewhere between ${minHint} and ${maxHint}`;
}
