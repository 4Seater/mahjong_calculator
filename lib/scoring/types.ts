export type WinType = "self_pick" | "discard";

export interface NoExposureBonusConfig {
  mode: "multiplier" | "flat";
  value: number;
}

export interface ScoreInput {
  basePoints: number;
  winType: WinType;
  jokerless: boolean;
  singlesAndPairs: boolean;
  numPlayers?: number;
  noExposures?: boolean;
  noExposureBonus?: NoExposureBonusConfig;
  misnamedJoker?: boolean;
  heavenlyHand?: boolean; // Wins by East before or right after the Charleston - 2× payout from all players
  wallGame?: boolean; // No wins when the tiles run out
  kittyPayout?: number; // Amount each player (including winner) pays to kitty when wall game and kitty enabled
  displayMode?: 'currency' | 'points'; // Display mode to determine if kitty is deducted (currency) or awarded (points)
  winnerId?: string;
  discarderId?: string;
  otherPlayerIds?: string[];

  jokerlessBonusPoints?: number; // Optional jokerless bonus in points (default 10)
  jokerlessAsPoints?: boolean; // If true, jokerless adds points instead of multiplier
  exposurePenaltyPerExposure?: number; // Optional exposure penalty (default 0, range 5-10)
  winnerExposureCount?: number; // Winner's exposure count for penalty calculation
  
  // Additional scoring rules (doubles)
  lastTileFromWall?: boolean; // Last tile taken from wall (doubles score)
  lastTileClaim?: boolean; // Last tile discarded in the game (doubles score)
  robbingTheJoker?: boolean; // Robbing a tile from a player's exposure (doubles score)
  fourFlowers?: boolean; // Four Flowers in hand (doubles score, only if card year rules apply)
  eastDouble?: boolean; // East's double payout (East pays or receives double)
  isWinnerEast?: boolean; // Explicitly mark if the winner is East (for East's double calculation)
  numDoubles?: number; // Total number of doubles (each doubles the score)
  customMultipliers?: {
    jokerless?: number; // Custom multiplier for jokerless (default 2 for self-pick, 4 for discard)
    misnamedJoker?: number; // Custom multiplier for mis-named joker (default 4)
    lastTileFromWall?: number; // Custom multiplier for last tile from wall (default 2)
    lastTileClaim?: number; // Custom multiplier for last tile claim (default 2)
    robbingTheJoker?: number; // Custom multiplier for robbing the joker (default 2)
  };
  customPoints?: {
    jokerless?: number; // Custom points bonus for jokerless (when using points instead of multiplier)
  };
  customRules?: Array<{
    id: string;
    // New format
    winnerBonus?: {
      type: 'points' | 'multiplier';
      value: number;
    };
    discarderPenalty?: {
      enabled: boolean;
      type: 'points' | 'multiplier';
      value: number;
    };
    allPlayerPenalty?: {
      enabled: boolean;
      type: 'points' | 'multiplier';
      value: number;
    };
    // Legacy format support
    type?: 'multiplier' | 'points' | 'opponentDeduction' | 'discarderDeduction';
    value?: number;
  }>; // Custom rules applied
}

export interface ScoreResult {
  rule: {
    allMultiplier?: number;
    discarderMultiplier?: number;
    otherMultiplier?: number;
    jokerlessApplied: boolean;
    misnamedJokerApplied?: boolean;
    heavenlyHandApplied?: boolean; // Whether Heavenly Hand is applied (2× payout)
    wallGameApplied?: boolean; // Whether wall game is enabled (no wins)
    kittyApplied?: boolean; // Whether kitty is enabled
    doublesApplied?: number; // Total number of doubles applied
    eastDoubleApplied?: boolean; // Whether East's double is applied
  };
  perLoserAmounts: { discarder?: number; others?: number };
  totalToWinner: number;
  payerMap: Record<string, number>;
  appliedNoExposureBonus?: {
    applied: boolean;
    mode?: "multiplier" | "flat";
    value?: number;
  };
  jokerlessPointsBonus?: number;
  exposurePenalty?: number;
  kittyPayout?: number; // Total kitty payout amount (amount per player × number of players)
  kittyPerPlayer?: number; // Amount each player pays to kitty
}

/* ---------------------- TOURNAMENT MODE ---------------------- */

export interface TournamentInput {
  // Core
  basePoints?: number;               // winner's hand value (points). Omit if wall/time-expired/false-MJ outcomes
  winType?: WinType;                 // "self_pick" or "discard"
  winnerId?: string;                 // required if a win occurred
  discarderId?: string | null;       // required if winType === "discard"
  playerIds: string[];               // all players at table (length = numPlayers)

  // Bonuses
  selfPick?: boolean;                // +10
  jokerless?: boolean;               // +20 (except Singles & Pairs)
  singlesAndPairs?: boolean;         // suppresses jokerless bonus

  // Penalty depends on winner's exposures at time of win
  // 0 or 1 exposure -> discarder -10 ; 2+ exposures -> discarder -20
  winnerExposureCount?: 0 | 1 | 2 | 3 | 4;

  // Wall / Time handling
  isWallGame?: boolean;              // if true and not timeExpired => +10 to each non-dead player
  timeExpiredNoScore?: boolean;      // if true => everyone gets 0 (overrides wall bonus)

  // Dead hands (no wall bonus)
  deadPlayerIds?: string[];          // these players do NOT get +10 on wall game

  // False Mah Jongg outcomes
  // Case A: False MJ & 3 others exposed => all 0
  // Case B: False MJ & exactly 1 player kept hand intact => that one gets +10, others 0
  falseMahjongAllExposed?: boolean;  // if true => all 0
  falseMahjongOneIntactId?: string | null; // that player gets +10, others 0
  
  // Custom rules
  customRules?: Array<{
    id: string;
    // New format
    winnerBonus?: {
      type: 'points' | 'multiplier';
      value: number;
    };
    discarderPenalty?: {
      enabled: boolean;
      type: 'points' | 'multiplier';
      value: number;
    };
    allPlayerPenalty?: {
      enabled: boolean;
      type: 'points' | 'multiplier';
      value: number;
    };
    // Legacy format support
    type?: 'multiplier' | 'points' | 'opponentDeduction' | 'discarderDeduction';
    value?: number;
  }>; // Custom rules applied
}

export interface TournamentResult {
  pointsByPlayer: Record<string, number>; // includes deductions as negatives
  breakdown: string[];                    // human-readable notes of what was applied
}

