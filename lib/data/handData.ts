import type { HandCardYear, HandCategory } from './handCategories';
import { HAND_CATEGORIES_BY_YEAR } from './handCategories';
import { HAND_SCORES_BY_YEAR } from './handScores';
import { INTERNATIONAL_HAND_CATEGORIES_BY_YEAR } from './internationalHandCategories';
import { INTERNATIONAL_HAND_SCORES_BY_YEAR } from './internationalHandScores';

export type { HandCardYear, HandCategory } from './handCategories';
export type CalculatorCardSet = 'american' | 'international';

const CATEGORIES_BY_CARD_SET: Record<
  CalculatorCardSet,
  Record<HandCardYear, HandCategory[]>
> = {
  american: HAND_CATEGORIES_BY_YEAR,
  international: INTERNATIONAL_HAND_CATEGORIES_BY_YEAR,
};

const SCORES_BY_CARD_SET: Record<
  CalculatorCardSet,
  Record<HandCardYear, Record<string, number>>
> = {
  american: HAND_SCORES_BY_YEAR,
  international: INTERNATIONAL_HAND_SCORES_BY_YEAR,
};

export const getCategoryById = (
  id: string,
  year: HandCardYear,
  cardSet: CalculatorCardSet = 'american'
): HandCategory | undefined => {
  return CATEGORIES_BY_CARD_SET[cardSet][year].find((cat) => cat.id === id);
};

export const getHandsByCategory = (
  categoryId: string,
  year: HandCardYear,
  cardSet: CalculatorCardSet = 'american'
): string[] => {
  const category = getCategoryById(categoryId, year, cardSet);
  if (!category || category.maxNumber === 0) {
    return [];
  }

  const hands: string[] = [];
  for (let i = category.minNumber; i <= category.maxNumber; i++) {
    hands.push(i.toString());
  }
  return hands;
};

export const formatHandName = (
  categoryId: string,
  handNumber: string,
  year: HandCardYear,
  cardSet: CalculatorCardSet = 'american'
): string => {
  const category = getCategoryById(categoryId, year, cardSet);
  if (!category) return handNumber;
  return `${category.name} - ${handNumber}`;
};

export const getHandCategoriesByYear = (
  year: HandCardYear,
  cardSet: CalculatorCardSet = 'american'
): HandCategory[] => {
  return CATEGORIES_BY_CARD_SET[cardSet][year];
};

export const getHandScore = (
  categoryId: string,
  lineNumber: string,
  year: HandCardYear,
  cardSet: CalculatorCardSet = 'american'
): number | undefined => {
  return SCORES_BY_CARD_SET[cardSet][year][`${categoryId}:${lineNumber}`];
};

export const getCategoriesForSavedHand = (
  year: HandCardYear,
  mode: 'standard' | 'tournament' | 'international'
): HandCategory[] => {
  const cardSet: CalculatorCardSet =
    mode === 'international' ? 'international' : 'american';
  return CATEGORIES_BY_CARD_SET[cardSet][year];
};
