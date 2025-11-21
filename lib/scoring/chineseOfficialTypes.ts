/**
 * Chinese Official Mahjong Scoring Types
 */

export type WinType = 'selfDraw' | 'discardWin';

export type Player = 'East' | 'South' | 'West' | 'North';

export interface Fan {
  id: string;
  name: string;
  points: number;
  category: string;
  /** List of fan IDs that IMPLY this fan (if any of those are taken, this one should not also score) */
  impliedBy: Set<string>;
  /** List of fan IDs this fan cannot be combined with (mutually exclusive) */
  incompatibleWith: Set<string>;
  /** Whether this fan requires the hand to be fully concealed */
  requiresConcealed: boolean;
  /** Whether this fan is a 'going out' fan (depends on winning method) */
  isGoingOutFan: boolean;
  /** Which melds/sets were used to create this fan (for Non-Separation principle) */
  usedMelds?: Array<any>; // MeldKind[] - using any to avoid circular import
}

export interface HandResult {
  totalPoints: number;   // total fan/points for hand
  paymentPerPlayer: Record<Player, number>;
  chosenFans: Fan[];
  fanPointsSum: number;
  flowerPoints: number;
}

export interface ChineseOfficialInput {
  selectedFanIDs: Set<string>;
  flowerCount: number;
  isSelfDraw: boolean;
  isConcealed: boolean;
  winningMethodIsDiscard: boolean;
  prevalentWindPungPresent: boolean;
  seatWindPungPresent: boolean;
  discarderIndex?: number;
  roundSeatIndex?: number;
  winnerId?: string;
  discarderId?: string;
  otherPlayerIds?: string[];
}

export interface ChineseOfficialResult {
  chosenFans: Fan[];
  fanPointsSum: number;
  flowerPoints: number;
  totalPoints: number;
  payouts: number[]; // per-player points cost (winner receives sum of positives)
  payerMap?: Record<string, number>; // player ID -> amount they pay
  totalToWinner: number;
  handResult?: HandResult; // Optional: cleaner HandResult format with Player types
}

