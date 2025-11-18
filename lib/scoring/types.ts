export type WinType = "self_pick" | "discard";

export interface NoExposureBonusConfig {
  mode: "multiplier" | "flat";
  value: number;
  suppressOnConcealedOnly?: boolean;
}

export interface ScoreInput {
  basePoints: number;
  winType: WinType;
  jokerless: boolean;
  singlesAndPairs: boolean;
  numPlayers?: number;
  noExposures?: boolean;
  isCardHandConcealedOnly?: boolean;
  noExposureBonus?: NoExposureBonusConfig;
  misnamedJoker?: boolean;
  winnerId?: string;
  discarderId?: string;
  otherPlayerIds?: string[];
}

export interface ScoreResult {
  rule: {
    allMultiplier?: number;
    discarderMultiplier?: number;
    otherMultiplier?: number;
    jokerlessApplied: boolean;
    misnamedJokerApplied?: boolean;
  };
  perLoserAmounts: { discarder?: number; others?: number };
  totalToWinner: number;
  payerMap: Record<string, number>;
  appliedNoExposureBonus?: {
    applied: boolean;
    mode?: "multiplier" | "flat";
    value?: number;
    suppressed?: boolean;
  };
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
}

export interface TournamentResult {
  pointsByPlayer: Record<string, number>; // includes deductions as negatives
  breakdown: string[];                    // human-readable notes of what was applied
}

