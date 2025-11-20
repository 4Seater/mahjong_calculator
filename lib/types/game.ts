export interface SavedHand {
  id: string;
  timestamp: number;
  handName: string; // Name/description from mahjong card
  basePoints: number;
  winType: "self_pick" | "discard";
  jokerless: boolean;
  singlesAndPairs: boolean;
  noExposures: boolean;
  totalToWinner: number;
  displayMode: "currency" | "points";
  mode: "standard" | "tournament";
  // Additional modifiers
  totalExposuresAtTable?: number;
  jokerlessAsPoints?: boolean;
  jokerlessBonusPoints?: number;
  exposurePenalty?: number;
  winnerExposureCount?: number;
  // Result details
  perLoserAmounts?: {
    discarder?: number;
    others?: number;
  };
  isWinner: boolean; // Whether the current user was the winner
}

export interface PlayerStats {
  totalWins: number;
  totalHands: number;
  favoriteHands: Record<string, number>; // handName -> count
  totalEarnings: number; // In points or cents
  averageHandValue: number;
  jokerlessCount: number;
  selfPickCount: number;
  discardWinCount: number;
}

