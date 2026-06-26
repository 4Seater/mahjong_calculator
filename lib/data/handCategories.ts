export interface HandCategory {
  id: string;
  name: string;
  minNumber: number;
  maxNumber: number;
}

export type HandCardYear = '2026' | '2025';
/** @deprecated Use HandCardYear — kept for existing imports */
export type AmericanHandYear = HandCardYear;

/**
 * Hand Category dropdown options for each American card year.
 *
 * 2026 categories and scores are added incrementally as card data is provided.
 */
export const HAND_CATEGORIES_BY_YEAR: Record<AmericanHandYear, HandCategory[]> = {
  '2025': [
    {
      id: '2025',
      name: '2025',
      minNumber: 1,
      maxNumber: 4,
    },
    {
      id: '2468',
      name: '2468',
      minNumber: 1,
      maxNumber: 8,
    },
    {
      id: 'any_like_numbers',
      name: 'Any Like Numbers',
      minNumber: 1,
      maxNumber: 3,
    },
    {
      id: 'quints',
      name: 'Quints',
      minNumber: 1,
      maxNumber: 3,
    },
    {
      id: 'consecutive_run',
      name: 'Consecutive Run',
      minNumber: 1,
      maxNumber: 8,
    },
    {
      id: '13579',
      name: '13579',
      minNumber: 1,
      maxNumber: 9,
    },
    {
      id: 'winds_dragons',
      name: 'Winds - Dragons',
      minNumber: 1,
      maxNumber: 8,
    },
    {
      id: '369',
      name: '369',
      minNumber: 1,
      maxNumber: 6,
    },
    {
      id: 'singles_pairs',
      name: 'Singles and Pairs',
      minNumber: 1,
      maxNumber: 6,
    },
  ],
  '2026': [
    {
      id: '2026',
      name: '2026',
      minNumber: 1,
      maxNumber: 4,
    },
    {
      id: '2468',
      name: '2468',
      minNumber: 1,
      maxNumber: 8,
    },
    {
      id: 'any_like_numbers',
      name: 'Any Like Numbers',
      minNumber: 1,
      maxNumber: 3,
    },
    {
      id: 'quints',
      name: 'Quints',
      minNumber: 1,
      maxNumber: 3,
    },
    {
      id: 'consecutive_run',
      name: 'Consecutive Run',
      minNumber: 1,
      maxNumber: 8,
    },
    {
      id: '13579',
      name: '13579',
      minNumber: 1,
      maxNumber: 9,
    },
    {
      id: 'winds_dragons',
      name: 'Winds - Dragons',
      minNumber: 1,
      maxNumber: 8,
    },
    {
      id: '369',
      name: '369',
      minNumber: 1,
      maxNumber: 6,
    },
    {
      id: 'singles_pairs',
      name: 'Singles and Pairs',
      minNumber: 1,
      maxNumber: 6,
    },
  ],
};

// Backwards-compatible alias (defaults to 2025).
export const HAND_CATEGORIES: HandCategory[] = HAND_CATEGORIES_BY_YEAR['2025'];

export const getCategoryById = (
  id: string,
  year: AmericanHandYear = '2025'
): HandCategory | undefined => {
  return HAND_CATEGORIES_BY_YEAR[year].find((cat) => cat.id === id);
};

export const getHandsByCategory = (
  categoryId: string,
  year: AmericanHandYear = '2025'
): string[] => {
  const category = getCategoryById(categoryId, year);
  if (!category || category.maxNumber === 0) {
    return [];
  }
  
  // Generate numbers from minNumber to maxNumber
  const hands: string[] = [];
  for (let i = category.minNumber; i <= category.maxNumber; i++) {
    hands.push(i.toString());
  }
  return hands;
};

export const formatHandName = (
  categoryId: string,
  handNumber: string,
  year: AmericanHandYear = '2025'
): string => {
  const category = getCategoryById(categoryId, year);
  if (!category) return handNumber;
  return `${category.name} - ${handNumber}`;
};

export const getHandCategoriesByYear = (year: AmericanHandYear): HandCategory[] => {
  return HAND_CATEGORIES_BY_YEAR[year];
};

