import { Fan } from '../chineseOfficialTypes';

/**
 * Complete list of Chinese Official Mahjong fans
 * Based on official scoring rules
 */
export const chineseOfficialFans: Fan[] = [
  // 1-pt fans
  {
    id: "pureDoubleChow",
    name: "Pure Double Chow",
    points: 1,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "mixedDoubleChow",
    name: "Mixed Double Chow",
    points: 1,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "shortStraight",
    name: "Short Straight",
    points: 1,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "twoTerminalChows",
    name: "Two Terminal Chows",
    points: 1,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "pungTermOrHonor_nonSeatPrev",
    name: "Pung of Terminals/Honors (not seat/prevalent)",
    points: 1,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "meldedKong",
    name: "Melded Kong",
    points: 1,
    category: "Kong-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "oneVoidedSuit",
    name: "One Voided Suit",
    points: 1,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "noHonorTiles",
    name: "No Honor Tiles",
    points: 1,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "edgeWait",
    name: "Edge Wait",
    points: 1,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: true,
  },
  {
    id: "closedWait",
    name: "Closed Wait",
    points: 1,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: true,
  },
  {
    id: "singleWait",
    name: "Single Wait",
    points: 1,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: true,
  },
  {
    id: "selfDrawn",
    name: "Self-Drawn",
    points: 1,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: true,
  },

  // 2-pt fans
  {
    id: "dragonPung",
    name: "Dragon Pung",
    points: 2,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "prevalentWindPung",
    name: "Prevalent Wind Pung",
    points: 2,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "seatWindPung",
    name: "Seat Wind Pung",
    points: 2,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "concealedHandWonByDiscard",
    name: "Concealed Hand (won by discard)",
    points: 2,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: true,
    isGoingOutFan: true,
  },
  {
    id: "allChows",
    name: "All Chows",
    points: 2,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "tileHog",
    name: "Tile Hog (uses all four of a suit tile w/o kong)",
    points: 2,
    category: "Special",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "doublePung",
    name: "Double Pung",
    points: 2,
    category: "Pung-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "twoConcealedPungs",
    name: "Two Concealed Pungs",
    points: 2,
    category: "Pung-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: true,
    isGoingOutFan: false,
  },
  {
    id: "concealedKong",
    name: "Concealed Kong",
    points: 2,
    category: "Kong-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: true,
    isGoingOutFan: false,
  },
  {
    id: "allSimples",
    name: "All Simples",
    points: 2,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },

  // 4-pt fans
  {
    id: "outsideHand",
    name: "Outside Hand",
    points: 4,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "fullyConcealedHand_selfDraw",
    name: "Fully Concealed Hand (self-draw)",
    points: 4,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: true,
    isGoingOutFan: true,
  },
  {
    id: "twoKongs",
    name: "Two Kongs",
    points: 4,
    category: "Kong-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "lastTile",
    name: "Last Tile (tile is last of its kind)",
    points: 4,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: true,
  },

  // 6-pt fans
  {
    id: "allPungs",
    name: "All Pungs",
    points: 6,
    category: "Pung-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "halfFlush",
    name: "Half Flush (one suit + honors)",
    points: 6,
    category: "Suit-Based",
    impliedBy: new Set(["fullFlush"]), // Full Flush implies Half Flush
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "mixedShiftedChows",
    name: "Mixed Shifted Chows",
    points: 6,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "allTypes",
    name: "All Types",
    points: 6,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "meldedHand",
    name: "Melded Hand",
    points: 6,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "twoDragonPungs",
    name: "Two Dragon Pungs",
    points: 6,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },

  // 8-pt fans
  {
    id: "mixedStraight",
    name: "Mixed Straight",
    points: 8,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "reversibleTiles",
    name: "Reversible Tiles",
    points: 8,
    category: "Special",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "mixedTripleChow",
    name: "Mixed Triple Chow",
    points: 8,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "mixedShiftedPungs",
    name: "Mixed Shifted Pungs",
    points: 8,
    category: "Pung-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "chickenHand",
    name: "Chicken Hand",
    points: 8,
    category: "Special",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "lastTileDraw",
    name: "Last Tile Draw (self-draw last tile)",
    points: 8,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: true,
  },
  {
    id: "lastTileClaim",
    name: "Last Tile Claim",
    points: 8,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: true,
  },
  {
    id: "outWithReplacementTile",
    name: "Out with Replacement Tile",
    points: 8,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: true,
  },
  {
    id: "robbingTheKong",
    name: "Robbing the Kong",
    points: 8,
    category: "Going Out",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: true,
  },
  {
    id: "twoConcealedKongs",
    name: "Two Concealed Kongs",
    points: 8,
    category: "Kong-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: true,
    isGoingOutFan: false,
  },

  // 12-pt fans
  {
    id: "lesserHonorsKnitted",
    name: "Lesser Honors & Knitted",
    points: 12,
    category: "Special",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "knittedStraight",
    name: "Knitted Straight",
    points: 12,
    category: "Special",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "upperFour",
    name: "Upper Four (6-9)",
    points: 12,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "lowerFour",
    name: "Lower Four (1-4)",
    points: 12,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "bigThreeWinds",
    name: "Big Three Winds",
    points: 12,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },

  // 16-pt fans
  {
    id: "pureStraight",
    name: "Pure Straight (three consecutive chows same suit)",
    points: 16,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "threeSuitedTerminalChows",
    name: "Three-Suited Terminal Chows",
    points: 16,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "pureShiftedChows",
    name: "Pure Shifted Chows",
    points: 16,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "allFives",
    name: "All Fives",
    points: 16,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "triplePung",
    name: "Triple Pung",
    points: 16,
    category: "Pung-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "threeConcealedPungs",
    name: "Three Concealed Pungs",
    points: 16,
    category: "Pung-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: true,
    isGoingOutFan: false,
  },

  // 24-pt fans
  {
    id: "sevenPairs",
    name: "Seven Pairs",
    points: 24,
    category: "Special",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "greaterHonorsKnitted",
    name: "Greater Honors & Knitted",
    points: 24,
    category: "Special",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "allEvenPungs",
    name: "All Even Pungs",
    points: 24,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "fullFlush",
    name: "Full Flush (one suit only)",
    points: 24,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "pureTripleChow",
    name: "Pure Triple Chow",
    points: 24,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "pureShiftedPungs",
    name: "Pure Shifted Pungs",
    points: 24,
    category: "Pung-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "upperTiles",
    name: "Upper Tiles (7-9)",
    points: 24,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "middleTiles",
    name: "Middle Tiles (4-6)",
    points: 24,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "lowerTiles",
    name: "Lower Tiles (1-3)",
    points: 24,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },

  // 32-pt fans
  {
    id: "fourShiftedChows",
    name: "Four Shifted Chows",
    points: 32,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "threeKongs",
    name: "Three Kongs",
    points: 32,
    category: "Kong-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "allTerminalsHonors",
    name: "All Terminals & Honors",
    points: 32,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },

  // 48-pt fans
  {
    id: "quadrupleChow",
    name: "Quadruple Chow",
    points: 48,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "fourPureShiftedPungs",
    name: "Four Pure Shifted Pungs",
    points: 48,
    category: "Pung-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },

  // 64-pt fans
  {
    id: "allTerminals",
    name: "All Terminals",
    points: 64,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "littleFourWinds",
    name: "Little Four Winds",
    points: 64,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "littleThreeDragons",
    name: "Little Three Dragons",
    points: 64,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "allHonors",
    name: "All Honors",
    points: 64,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "fourConcealedPungs",
    name: "Four Concealed Pungs",
    points: 64,
    category: "Pung-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: true,
    isGoingOutFan: false,
  },
  {
    id: "pureTerminalChows",
    name: "Pure Terminal Chows",
    points: 64,
    category: "Chow-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },

  // 88-pt fans (limit hands)
  {
    id: "bigFourWinds",
    name: "Big Four Winds",
    points: 88,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "bigThreeDragons",
    name: "Big Three Dragons",
    points: 88,
    category: "Terminals/Honors",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "allGreen",
    name: "All Green",
    points: 88,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "nineGates",
    name: "Nine Gates (concealed)",
    points: 88,
    category: "Suit-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: true,
    isGoingOutFan: false,
  },
  {
    id: "fourKongs",
    name: "Four Kongs",
    points: 88,
    category: "Kong-Based",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
  {
    id: "sevenShiftedPairs",
    name: "Seven Shifted Pairs",
    points: 88,
    category: "Special",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: true,
    isGoingOutFan: false,
  },
  {
    id: "thirteenOrphans",
    name: "Thirteen Orphans",
    points: 88,
    category: "Special",
    impliedBy: new Set(),
    incompatibleWith: new Set(),
    requiresConcealed: false,
    isGoingOutFan: false,
  },
];

// Apply impliedBy relationships and incompatibilities
const fanMap = new Map(chineseOfficialFans.map(f => [f.id, f]));

function replaceFan(id: string, implied: Set<string> = new Set(), incompatible: Set<string> = new Set()) {
  const fan = fanMap.get(id);
  if (fan) {
    // Add to impliedBy
    implied.forEach(implierId => fan.impliedBy.add(implierId));
    // Add to incompatibleWith
    incompatible.forEach(incompatId => fan.incompatibleWith.add(incompatId));
  }
}

// Expanded implications and incompatibilities
// Full Flush implies Half Flush, One Voided Suit, No Honor Tiles, All Simples, etc.
replaceFan("halfFlush", new Set(["fullFlush"]));
replaceFan("oneVoidedSuit", new Set(["fullFlush", "halfFlush"]));
replaceFan("noHonorTiles", new Set(["fullFlush", "halfFlush", "allSimples"]));
replaceFan("allSimples", new Set(["fullFlush", "halfFlush", "noHonorTiles"]));

// Full Flush incompatible with any that require honors only or other suits mixing
replaceFan("fullFlush", new Set(), new Set(["oneVoidedSuit", "noHonorTiles", "allSimples", "halfFlush"]));

// Seven Pairs excludes All Pungs, Pure Triple Chow, Four Concealed Pungs etc.
replaceFan("sevenPairs", new Set(), new Set(["allPungs", "fourConcealedPungs", "pureTripleChow", "pureShiftedPungs", "sevenShiftedPairs"]));

// Knitted and Greater/Lesser honors relationships
replaceFan("greaterHonorsKnitted", new Set(), new Set(["lesserHonorsKnitted"]));
replaceFan("lesserHonorsKnitted", new Set(), new Set(["greaterHonorsKnitted"]));

// Reversible tiles implies not many other suit-based hands
replaceFan("reversibleTiles", new Set(), new Set(["fullFlush", "halfFlush", "allTerminals", "allHonors"]));

// Middle / Upper / Lower tiles: mutually exclusive
replaceFan("upperTiles", new Set(), new Set(["middleTiles", "lowerTiles", "allFives"]));
replaceFan("middleTiles", new Set(), new Set(["upperTiles", "lowerTiles", "allFives"]));
replaceFan("lowerTiles", new Set(), new Set(["upperTiles", "middleTiles", "allFives"]));

// All Types (each set different type) incompatible with All Pungs
replaceFan("allTypes", new Set(), new Set(["allPungs"]));

// Pure Straight (16) implies Mixed Straight (8) so exclude mixed if pure chosen
replaceFan("mixedStraight", new Set(["pureStraight"]));
replaceFan("pureStraight", new Set(), new Set(["mixedStraight"]));

// Pure Triple Chow implies Mixed Triple Chow and Mixed Straight in many cases — we prefer pure
replaceFan("mixedTripleChow", new Set(["pureTripleChow"]));
replaceFan("pureTripleChow", new Set(), new Set(["mixedTripleChow", "mixedStraight"]));

// Four Kongs (88) implies Three Kongs (32) / Two Kongs (4)
replaceFan("threeKongs", new Set(["fourKongs"]));
replaceFan("twoKongs", new Set(["threeKongs", "fourKongs"]));
replaceFan("fourKongs", new Set(), new Set(["threeKongs", "twoKongs"])); // prefer 88-point

// Big/Small winds/dragons exclusivity adjustments
replaceFan("bigFourWinds", new Set(), new Set(["littleFourWinds", "bigThreeWinds"]));
replaceFan("bigThreeDragons", new Set(), new Set(["littleThreeDragons"]));

// All Honors implies not Full Flush or Half Flush
replaceFan("allHonors", new Set(), new Set(["fullFlush", "halfFlush", "allSimples", "noHonorTiles"]));

// All Terminals implies not All Fives or Full Flush
replaceFan("allTerminals", new Set(), new Set(["allFives", "fullFlush", "halfFlush"]));

/**
 * Fan Points Dictionary - Quick lookup by fan name
 * Maps fan display names to their point values
 */
export const fanPoints: Record<string, number> = {
  // 1-point fans
  "Pure Double Chow": 1,
  "Mixed Double Chow": 1,
  "Short Straight": 1,
  "Two Terminal Chows": 1,
  "Pung of Terminals or Honors": 1,
  "Melded Kong": 1,
  "One Voided Suit": 1,
  "No Honor Tiles": 1,
  "Edge Wait": 1,
  "Closed Wait": 1,
  "Single Wait": 1,
  "Self-Drawn": 1,
  "Flower Tiles": 1,

  // 2-point fans
  "Dragon Pung": 2,
  "Prevalent Wind": 2,
  "Seat Wind": 2,
  "Concealed Hand": 2,
  "All Chows": 2,
  "Tile Hog": 2,
  "Double Pung": 2,
  "Two Concealed Pungs": 2,
  "Concealed Kong": 2,
  "All Simples": 2,

  // 4-point fans
  "Outside Hand": 4,
  "Fully Concealed Hand": 4,
  "Two Kongs": 4,
  "Last Tile": 4,

  // 6-point fans
  "All Pungs": 6,
  "Half Flush": 6,
  "Mixed Shifted Chows": 6,
  "All Types": 6,
  "Melded Hand": 6,
  "Two Dragon Pungs": 6,

  // 8-point fans
  "Mixed Straight": 8,
  "Reversible Tiles": 8,
  "Mixed Triple Chow": 8,
  "Mixed Shifted Pungs": 8,
  "Chicken Hand": 8,
  "Last Tile Draw": 8,
  "Last Tile Claim": 8,
  "Out with Replacement Tile": 8,
  "Robbing the Kong": 8,
  "Two Concealed Kongs": 8,

  // 12-point fans
  "Lesser Honors and Knitted Tiles": 12,
  "Knitted Straight": 12,
  "Upper Four": 12,
  "Lower Four": 12,
  "Big Three Winds": 12,

  // 16-point fans
  "Pure Straight": 16,
  "Three-Suited Terminal Chows": 16,
  "Pure Shifted Chows": 16,
  "All Fives": 16,
  "Triple Pung": 16,
  "Three Concealed Pungs": 16,

  // 24-point fans
  "Seven Pairs": 24,
  "Greater Honors and Knitted Tiles": 24,
  "All Even Pungs": 24,
  "Full Flush": 24,
  "Pure Triple Chow": 24,
  "Pure Shifted Pungs": 24,
  "Upper Tiles": 24,
  "Middle Tiles": 24,
  "Lower Tiles": 24,

  // 32-point fans
  "Four Shifted Chows": 32,
  "Three Kongs": 32,
  "All Terminals and Honors": 32,

  // 48-point fans
  "Quadruple Chow": 48,
  "Four Pure Shifted Pungs": 48,

  // 64-point fans
  "All Terminals": 64,
  "Little Four Winds": 64,
  "Little Three Dragons": 64,
  "All Honors": 64,
  "Four Concealed Pungs": 64,
  "Pure Terminal Chows": 64,

  // 88-point fans
  "Big Four Winds": 88,
  "Big Three Dragons": 88,
  "All Green": 88,
  "Nine Gates": 88,
  "Four Kongs": 88,
  "Seven Shifted Pairs": 88,
  "Thirteen Orphans": 88,
};

/**
 * Get all fan names as an array for UI selection
 */
export const handFanOptions: string[] = Object.keys(fanPoints).sort((a, b) => {
  // Sort by points (descending), then alphabetically
  const pointsA = fanPoints[a] || 0;
  const pointsB = fanPoints[b] || 0;
  if (pointsA !== pointsB) {
    return pointsB - pointsA; // Higher points first
  }
  return a.localeCompare(b);
});

/**
 * Get fan points by name (case-insensitive lookup)
 */
export function getFanPointsByName(fanName: string): number {
  // Try exact match first
  if (fanPoints[fanName]) {
    return fanPoints[fanName];
  }
  
  // Try case-insensitive match
  const lowerName = fanName.toLowerCase();
  for (const [name, points] of Object.entries(fanPoints)) {
    if (name.toLowerCase() === lowerName) {
      return points;
    }
  }
  
  return 0;
}

