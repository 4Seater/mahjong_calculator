import type { HandCategory, HandCardYear } from './handCategories';

/**
 * International Mahjong hand categories by card year.
 * Add categories and line ranges as card data is provided.
 */
export const INTERNATIONAL_HAND_CATEGORIES_BY_YEAR: Record<HandCardYear, HandCategory[]> = {
  '2025': [],
  '2026': [
    {
      id: 'year_of_the_horse',
      name: 'Year of the Horse',
      minNumber: 1,
      maxNumber: 6,
    },
    {
      id: 'pungs_and_chows',
      name: 'Pungs and Chows',
      minNumber: 1,
      maxNumber: 5,
    },
    {
      id: 'flower_bouquet',
      name: 'Flower Bouquet',
      minNumber: 1,
      maxNumber: 5,
    },
    {
      id: 'consecutive_numbers',
      name: 'Consecutive Numbers',
      minNumber: 1,
      maxNumber: 6,
    },
    {
      id: 'same_number',
      name: 'Same Number',
      minNumber: 1,
      maxNumber: 5,
    },
    {
      id: 'windy_dragons',
      name: 'Windy Dragons',
      minNumber: 1,
      maxNumber: 7,
    },
    {
      id: 'evens',
      name: 'Evens',
      minNumber: 1,
      maxNumber: 6,
    },
    {
      id: 'odds',
      name: 'Odds',
      minNumber: 1,
      maxNumber: 5,
    },
    {
      id: 'lucky_eights',
      name: 'Lucky Eights',
      minNumber: 1,
      maxNumber: 6,
    },
  ],
};
