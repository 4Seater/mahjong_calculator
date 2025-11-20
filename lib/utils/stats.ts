import { SavedHand, PlayerStats } from '../types/game';

export const calculateStats = (hands: SavedHand[]): PlayerStats => {
  if (hands.length === 0) {
    return {
      totalWins: 0,
      totalHands: 0,
      favoriteHands: {},
      totalEarnings: 0,
      averageHandValue: 0,
      jokerlessCount: 0,
      selfPickCount: 0,
      discardWinCount: 0,
    };
  }

  const wins = hands.filter(h => h.isWinner);
  const totalEarnings = wins.reduce((sum, h) => sum + h.totalToWinner, 0);
  const favoriteHands: Record<string, number> = {};
  
  hands.forEach(hand => {
    if (hand.handName) {
      favoriteHands[hand.handName] = (favoriteHands[hand.handName] || 0) + 1;
    }
  });

  return {
    totalWins: wins.length,
    totalHands: hands.length,
    favoriteHands,
    totalEarnings,
    averageHandValue: wins.length > 0 ? totalEarnings / wins.length : 0,
    jokerlessCount: hands.filter(h => h.jokerless).length,
    selfPickCount: hands.filter(h => h.winType === 'self_pick').length,
    discardWinCount: hands.filter(h => h.winType === 'discard').length,
  };
};

