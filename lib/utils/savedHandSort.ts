import type { HandCardYear } from '@/lib/data/handCategories';
import { getCategoriesForSavedHand } from '@/lib/data/handData';
import type { SavedHand } from '@/lib/types/game';

export type StatsCardSet = 'american' | 'international';

export const CARD_YEARS: HandCardYear[] = ['2026', '2025'];

export const STATS_CARD_SETS: { id: StatsCardSet; label: string }[] = [
  { id: 'american', label: 'National Mahjong League' },
  { id: 'international', label: 'International Mahjong' },
];

export const getHandCardYear = (hand: SavedHand): HandCardYear => {
  return hand.cardYear ?? '2025';
};

export const getSavedHandCardSet = (hand: SavedHand): StatsCardSet => {
  return hand.mode === 'international' ? 'international' : 'american';
};

export const filterHandsByCardSetAndYear = (
  hands: SavedHand[],
  cardSet: StatsCardSet,
  year: HandCardYear
): SavedHand[] => {
  return hands.filter(
    (hand) =>
      getSavedHandCardSet(hand) === cardSet && getHandCardYear(hand) === year
  );
};

/** Sort saved hands in card order (category, then line number). */
export const sortHandsByCardOrder = (
  hands: SavedHand[],
  cardSet: StatsCardSet,
  year: HandCardYear
): SavedHand[] => {
  const mode = cardSet === 'international' ? 'international' : 'standard';
  const categoryOrder = new Map(
    getCategoriesForSavedHand(year, mode).map((category, index) => [
      category.id,
      index,
    ])
  );

  return [...hands].sort((a, b) => {
    const aOrder =
      a.categoryId !== undefined ? categoryOrder.get(a.categoryId) : undefined;
    const bOrder =
      b.categoryId !== undefined ? categoryOrder.get(b.categoryId) : undefined;

    if (aOrder === undefined && bOrder === undefined) {
      return a.timestamp - b.timestamp;
    }
    if (aOrder === undefined) return 1;
    if (bOrder === undefined) return -1;
    if (aOrder !== bOrder) return aOrder - bOrder;

    const aLine = a.lineNumber ?? 0;
    const bLine = b.lineNumber ?? 0;
    if (aLine !== bLine) return aLine - bLine;

    return a.timestamp - b.timestamp;
  });
};
