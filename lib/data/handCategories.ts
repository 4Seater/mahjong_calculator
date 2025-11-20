export interface HandCategory {
  id: string;
  name: string;
  minNumber: number;
  maxNumber: number;
}

export const HAND_CATEGORIES: HandCategory[] = [
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
];

export const getCategoryById = (id: string): HandCategory | undefined => {
  return HAND_CATEGORIES.find(cat => cat.id === id);
};

export const getHandsByCategory = (categoryId: string): string[] => {
  const category = getCategoryById(categoryId);
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

export const formatHandName = (categoryId: string, handNumber: string): string => {
  const category = getCategoryById(categoryId);
  if (!category) return handNumber;
  return `${category.name} - ${handNumber}`;
};

