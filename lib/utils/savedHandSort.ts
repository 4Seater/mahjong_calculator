import type { AmericanHandYear } from '@/lib/data/handCategories';
import { HAND_CATEGORIES_BY_YEAR } from '@/lib/data/handCategories';
import type { SavedHand } from '@/lib/types/game';

export const CARD_YEARS: AmericanHandYear[] = ['2026', '2025'];

export const getHandCardYear = (hand: SavedHand): AmericanHandYear => {
  return hand.cardYear ?? '2025';
};

export const filterHandsByYear = (
  hands: SavedHand[],
  year: AmericanHandYear
): SavedHand[] => {
  return hands.filter((hand) => getHandCardYear(hand) === year);
};

/** Sort saved hands in NMJL card order (category, then line number). */
export const sortHandsByCardOrder = (
  hands: SavedHand[],
  year: AmericanHandYear
): SavedHand[] => {
  const categoryOrder = new Map(
    HAND_CATEGORIES_BY_YEAR[year].map((category, index) => [category.id, index])
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
