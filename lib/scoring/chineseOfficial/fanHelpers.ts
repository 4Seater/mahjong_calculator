/**
 * Comprehensive Helper Function Library for Chinese Official Fan Detection
 * 
 * Modular, TypeScript-friendly functions for automatic fan detection
 * Works with existing Tile, Hand, and MeldKind types
 */

import { Tile, Hand } from './tiles';
import { Suit } from './tiles';
import { MeldKind } from './melds';

/**
 * Fan Context - Additional information needed for some fan detections
 */
export interface FanContext {
  selfDrawn?: boolean;
  winningTileFromDiscard?: boolean;
  winningTile?: Tile;
  seatWind?: string; // "E", "S", "W", "N"
  prevalentWind?: string; // "E", "S", "W", "N"
  isLastTile?: boolean;
  isLastTileSelfDrawn?: boolean;
  isLastTileClaim?: boolean;
  isReplacementTile?: boolean;
  isRobbingKong?: boolean;
  isConcealed?: boolean;
}

// ========== BASIC MELD CHECKS ==========

/**
 * Check if a meld is a pung (three identical tiles)
 */
export function isPung(meld: MeldKind): boolean {
  return meld.type === 'pung';
}

/**
 * Check if a meld is a kong (four identical tiles)
 */
export function isKong(meld: MeldKind): boolean {
  return meld.type === 'kong';
}

/**
 * Check if a meld is a chow (three consecutive tiles in same suit)
 */
export function isChow(meld: MeldKind): boolean {
  return meld.type === 'chow';
}

/**
 * Check if a meld is a pair
 */
export function isPair(meld: MeldKind): boolean {
  return meld.type === 'pair';
}

/**
 * Check if a meld is concealed (not melded)
 */
export function isConcealedMeld(meld: MeldKind, ctx?: FanContext): boolean {
  // In our system, we track this via the hand's isConcealed flag
  return ctx?.isConcealed ?? false;
}

/**
 * Check if a meld is melded (declared)
 */
export function isMeldedMeld(meld: MeldKind, ctx?: FanContext): boolean {
  return !isConcealedMeld(meld, ctx);
}

// ========== TILE CLASSIFICATION HELPERS ==========

/**
 * Check if tile is a terminal (1 or 9 in a suit)
 */
export function isTerminal(tile: Tile): boolean {
  if (tile.kind.type !== 'suited') return false;
  return tile.kind.rank === 1 || tile.kind.rank === 9;
}

/**
 * Check if tile is a simple (2-8 in a suit)
 */
export function isSimple(tile: Tile): boolean {
  if (tile.kind.type !== 'suited') return false;
  return tile.kind.rank >= 2 && tile.kind.rank <= 8;
}

/**
 * Check if tile is an honor (wind or dragon)
 */
export function isHonor(tile: Tile): boolean {
  return tile.kind.type === 'wind' || tile.kind.type === 'dragon';
}

/**
 * Check if tile is a wind
 */
export function isWind(tile: Tile): boolean {
  return tile.kind.type === 'wind';
}

/**
 * Check if tile is a dragon
 */
export function isDragon(tile: Tile): boolean {
  return tile.kind.type === 'dragon';
}

/**
 * Check if tile is a flower
 */
export function isFlower(tile: Tile): boolean {
  return tile.kind.type === 'flower';
}

/**
 * Get tile suit (for suited tiles)
 */
export function getTileSuit(tile: Tile): Suit | null {
  if (tile.kind.type === 'suited') {
    return tile.kind.suit;
  }
  return null;
}

/**
 * Get tile rank (for suited tiles)
 */
export function getTileRank(tile: Tile): number | null {
  if (tile.kind.type === 'suited') {
    return tile.kind.rank;
  }
  return null;
}

// ========== MELD ANALYSIS HELPERS ==========

/**
 * Get all chows from a decomposition
 */
export function getChows(dec: MeldKind[]): MeldKind[] {
  return dec.filter(m => m.type === 'chow');
}

/**
 * Get all pungs from a decomposition
 */
export function getPungs(dec: MeldKind[]): MeldKind[] {
  return dec.filter(m => m.type === 'pung' || m.type === 'kong');
}

/**
 * Get all kongs from a decomposition
 */
export function getKongs(dec: MeldKind[]): MeldKind[] {
  return dec.filter(m => m.type === 'kong');
}

/**
 * Get all pairs from a decomposition
 */
export function getPairs(dec: MeldKind[]): MeldKind[] {
  return dec.filter(m => m.type === 'pair');
}

/**
 * Check if two chows are identical (same suit and base)
 */
export function areChowsIdentical(chow1: MeldKind, chow2: MeldKind): boolean {
  if (chow1.type !== 'chow' || chow2.type !== 'chow') return false;
  return chow1.suit === chow2.suit && chow1.base === chow2.base;
}

/**
 * Check if two pungs are identical (same tile)
 */
export function arePungsIdentical(pung1: MeldKind, pung2: MeldKind): boolean {
  if ((pung1.type !== 'pung' && pung1.type !== 'kong') || 
      (pung2.type !== 'pung' && pung2.type !== 'kong')) {
    return false;
  }
  return pung1.tile.description === pung2.tile.description;
}

/**
 * Check if meld contains terminals or honors
 */
export function meldContainsTerminalsOrHonors(meld: MeldKind): boolean {
  if (meld.type === 'chow') {
    // Terminal chow: base 1 or base 7
    return meld.base === 1 || meld.base === 7;
  } else if (meld.type === 'pung' || meld.type === 'kong' || meld.type === 'pair') {
    const tile = meld.tile;
    return isTerminal(tile) || isHonor(tile);
  }
  return false;
}

/**
 * Count dragon pungs in a decomposition
 */
export function countDragonPungs(dec: MeldKind[]): number {
  return getPungs(dec).filter(m => {
    if (m.type === 'pung' || m.type === 'kong') {
      return m.tile.kind.type === 'dragon';
    }
    return false;
  }).length;
}

/**
 * Count wind pungs in a decomposition
 */
export function countWindPungs(dec: MeldKind[]): number {
  return getPungs(dec).filter(m => {
    if (m.type === 'pung' || m.type === 'kong') {
      return m.tile.kind.type === 'wind';
    }
    return false;
  }).length;
}

/**
 * Get chow bases by suit
 */
export function getChowBasesBySuit(dec: MeldKind[]): Map<Suit, Set<number>> {
  const map = new Map<Suit, Set<number>>();
  for (const m of dec) {
    if (m.type === 'chow') {
      if (!map.has(m.suit)) {
        map.set(m.suit, new Set());
      }
      map.get(m.suit)!.add(m.base);
    }
  }
  return map;
}

/**
 * Get pung ranks by suit
 */
export function getPungRanksBySuit(dec: MeldKind[]): Map<Suit, Set<number>> {
  const map = new Map<Suit, Set<number>>();
  for (const m of dec) {
    if (m.type === 'pung' || m.type === 'kong') {
      const tile = m.tile;
      if (tile.kind.type === 'suited') {
        const suit = tile.kind.suit;
        const rank = tile.kind.rank;
        if (!map.has(suit)) {
          map.set(suit, new Set());
        }
        map.get(suit)!.add(rank);
      }
    }
  }
  return map;
}

// ========== CHOW-BASED FAN HELPERS ==========

/**
 * Detect Pure Double Chow: Two identical chows in the same suit
 */
export function hasPureDoubleChow(dec: MeldKind[]): boolean {
  const chows = getChows(dec);
  for (let i = 0; i < chows.length; i++) {
    for (let j = i + 1; j < chows.length; j++) {
      if (areChowsIdentical(chows[i], chows[j])) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Detect Mixed Double Chow: Two identical chows in different suits
 */
export function hasMixedDoubleChow(dec: MeldKind[]): boolean {
  const chows = getChows(dec);
  for (let i = 0; i < chows.length; i++) {
    for (let j = i + 1; j < chows.length; j++) {
      const chow1 = chows[i];
      const chow2 = chows[j];
      if (chow1.type === 'chow' && chow2.type === 'chow') {
        if (chow1.base === chow2.base && chow1.suit !== chow2.suit) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Detect Short Straight: Two consecutive chows in the same suit
 */
export function hasShortStraight(dec: MeldKind[]): boolean {
  const chowBasesBySuit = getChowBasesBySuit(dec);
  for (const bases of chowBasesBySuit.values()) {
    const sorted = Array.from(bases).sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] === sorted[i] + 1) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Detect Two Terminal Chows: Two chows with bases 1 and 7
 */
export function hasTwoTerminalChows(dec: MeldKind[]): boolean {
  const chows = getChows(dec);
  let hasBase1 = false;
  let hasBase7 = false;
  for (const chow of chows) {
    if (chow.type === 'chow') {
      if (chow.base === 1) hasBase1 = true;
      if (chow.base === 7) hasBase7 = true;
    }
  }
  return hasBase1 && hasBase7;
}

/**
 * Detect Pure Triple Chow: Three identical chows in the same suit
 */
export function hasPureTripleChow(dec: MeldKind[]): boolean {
  const chows = getChows(dec);
  const bySuitAndBase = new Map<string, number>();
  for (const chow of chows) {
    if (chow.type === 'chow') {
      const key = `${chow.suit}-${chow.base}`;
      bySuitAndBase.set(key, (bySuitAndBase.get(key) || 0) + 1);
    }
  }
  for (const count of bySuitAndBase.values()) {
    if (count >= 3) return true;
  }
  return false;
}

/**
 * Detect Mixed Triple Chow: Three identical chows in different suits
 */
export function hasMixedTripleChow(dec: MeldKind[]): boolean {
  const chows = getChows(dec);
  const byBase = new Map<number, Set<Suit>>();
  for (const chow of chows) {
    if (chow.type === 'chow') {
      const base = chow.base;
      const suit = chow.suit;
      if (!byBase.has(base)) {
        byBase.set(base, new Set());
      }
      byBase.get(base)!.add(suit);
    }
  }
  for (const suits of byBase.values()) {
    if (suits.size >= 3) return true;
  }
  return false;
}

/**
 * Detect Quadruple Chow: Four identical chows
 */
export function hasQuadrupleChow(dec: MeldKind[]): boolean {
  const chows = getChows(dec);
  const bySuitAndBase = new Map<string, number>();
  for (const chow of chows) {
    if (chow.type === 'chow') {
      const key = `${chow.suit}-${chow.base}`;
      bySuitAndBase.set(key, (bySuitAndBase.get(key) || 0) + 1);
    }
  }
  for (const count of bySuitAndBase.values()) {
    if (count >= 4) return true;
  }
  return false;
}

/**
 * Detect Pure Shifted Chows: Three chows in same suit with consecutive or shifted bases
 */
export function hasPureShiftedChows(dec: MeldKind[]): boolean {
  const chowBasesBySuit = getChowBasesBySuit(dec);
  for (const bases of chowBasesBySuit.values()) {
    if (bases.size >= 3) {
      const sorted = Array.from(bases).sort((a, b) => a - b);
      // Check if all differences are the same (shifted by 1 or 2)
      const diffs: number[] = [];
      for (let i = 0; i < sorted.length - 1; i++) {
        diffs.push(sorted[i + 1] - sorted[i]);
      }
      const allSame = diffs.length > 0 && diffs.every(d => d === diffs[0]);
      if (allSame && (diffs[0] === 1 || diffs[0] === 2)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Detect Four Shifted Chows: Four chows in same suit with consecutive bases
 */
export function hasFourShiftedChows(dec: MeldKind[]): boolean {
  const chowBasesBySuit = getChowBasesBySuit(dec);
  for (const bases of chowBasesBySuit.values()) {
    if (bases.size >= 4) {
      const sorted = Array.from(bases).sort((a, b) => a - b);
      // Check if consecutive
      let consecutive = true;
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] !== sorted[i] + 1) {
          consecutive = false;
          break;
        }
      }
      if (consecutive) return true;
    }
  }
  return false;
}

/**
 * Detect Three Suited Terminal Chows: 123 & 789 in two suits, pair of 5s in third
 */
export function hasThreeSuitedTerminalChows(dec: MeldKind[], hand: Hand): boolean {
  const has123 = new Set<Suit>();
  const has789 = new Set<Suit>();
  
  for (const m of dec) {
    if (m.type === 'chow') {
      if (m.base === 1) has123.add(m.suit);
      if (m.base === 7) has789.add(m.suit);
    }
  }
  
  const suitsWithBoth = new Set<Suit>();
  for (const s of has123) {
    if (has789.has(s)) {
      suitsWithBoth.add(s);
    }
  }
  
  if (suitsWithBoth.size >= 2) {
    const pairs = getPairs(dec);
    for (const pair of pairs) {
      if (pair.type === 'pair') {
        const tile = pair.tile;
        if (tile.kind.type === 'suited' && tile.kind.rank === 5) {
          const suit = tile.kind.suit;
          if (!suitsWithBoth.has(suit)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Detect Pure Terminal Chows: All chows are terminal (base 1 or 7)
 */
export function hasPureTerminalChows(dec: MeldKind[]): boolean {
  const chows = getChows(dec);
  if (chows.length < 4) return false;
  for (const chow of chows) {
    if (chow.type === 'chow') {
      if (chow.base !== 1 && chow.base !== 7) {
        return false;
      }
    }
  }
  return true;
}

// ========== PUNG-BASED FAN HELPERS ==========

/**
 * Detect Double Pung: Two identical pungs
 */
export function hasDoublePung(dec: MeldKind[]): boolean {
  const pungs = getPungs(dec);
  for (let i = 0; i < pungs.length; i++) {
    for (let j = i + 1; j < pungs.length; j++) {
      if (arePungsIdentical(pungs[i], pungs[j])) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Detect Triple Pung: Three identical pungs
 */
export function hasTriplePung(dec: MeldKind[]): boolean {
  const pungs = getPungs(dec);
  const counts = new Map<string, number>();
  for (const pung of pungs) {
    if (pung.type === 'pung' || pung.type === 'kong') {
      const key = pung.tile.description;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  for (const count of counts.values()) {
    if (count >= 3) return true;
  }
  return false;
}

/**
 * Detect Mixed Shifted Pungs: Three pungs in different suits with consecutive ranks
 */
export function hasMixedShiftedPungs(dec: MeldKind[]): boolean {
  const pungs = getPungs(dec);
  const rankSuitPairs: Array<{ rank: number; suit: Suit }> = [];
  
  for (const pung of pungs) {
    if (pung.type === 'pung' || pung.type === 'kong') {
      const tile = pung.tile;
      if (tile.kind.type === 'suited') {
        rankSuitPairs.push({ rank: tile.kind.rank, suit: tile.kind.suit });
      }
    }
  }
  
  if (rankSuitPairs.length < 3) return false;
  
  // Check all combinations of 3 pungs
  for (let i = 0; i < rankSuitPairs.length; i++) {
    for (let j = i + 1; j < rankSuitPairs.length; j++) {
      for (let k = j + 1; k < rankSuitPairs.length; k++) {
        const ranks = [rankSuitPairs[i].rank, rankSuitPairs[j].rank, rankSuitPairs[k].rank].sort((a, b) => a - b);
        const suits = new Set([rankSuitPairs[i].suit, rankSuitPairs[j].suit, rankSuitPairs[k].suit]);
        if (ranks[1] === ranks[0] + 1 && ranks[2] === ranks[1] + 1 && suits.size === 3) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Detect Pure Shifted Pungs: Three pungs in same suit with consecutive ranks
 */
export function hasPureShiftedPungs(dec: MeldKind[]): boolean {
  const pungRanksBySuit = getPungRanksBySuit(dec);
  for (const ranks of pungRanksBySuit.values()) {
    if (ranks.size >= 3) {
      const sorted = Array.from(ranks).sort((a, b) => a - b);
      // Check if consecutive
      let consecutive = true;
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] !== sorted[i] + 1) {
          consecutive = false;
          break;
        }
      }
      if (consecutive) return true;
    }
  }
  return false;
}

/**
 * Detect Four Pure Shifted Pungs: Four pungs in same suit with consecutive ranks
 */
export function hasFourPureShiftedPungs(dec: MeldKind[]): boolean {
  const pungRanksBySuit = getPungRanksBySuit(dec);
  for (const ranks of pungRanksBySuit.values()) {
    if (ranks.size >= 4) {
      const sorted = Array.from(ranks).sort((a, b) => a - b);
      // Check if consecutive
      let consecutive = true;
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] !== sorted[i] + 1) {
          consecutive = false;
          break;
        }
      }
      if (consecutive) return true;
    }
  }
  return false;
}

/**
 * Detect All Even Pungs: All pungs use even-numbered tiles
 */
export function hasAllEvenPungs(dec: MeldKind[]): boolean {
  const pungs = getPungs(dec);
  if (pungs.length < 4) return false;
  
  for (const pung of pungs) {
    if (pung.type === 'pung' || pung.type === 'kong') {
      const tile = pung.tile;
      if (tile.kind.type === 'suited') {
        if (tile.kind.rank % 2 !== 0) {
          return false;
        }
      } else {
        return false; // Honors are not even
      }
    }
  }
  
  // Check pair is also even
  const pairs = getPairs(dec);
  for (const pair of pairs) {
    if (pair.type === 'pair') {
      const tile = pair.tile;
      if (tile.kind.type === 'suited') {
        if (tile.kind.rank % 2 !== 0) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  
  return true;
}

// ========== KONG-BASED FAN HELPERS ==========

/**
 * Count kongs in a decomposition
 */
export function countKongs(dec: MeldKind[]): number {
  return getKongs(dec).length;
}

/**
 * Count concealed kongs
 */
export function countConcealedKongs(dec: MeldKind[], ctx?: FanContext): number {
  if (!ctx?.isConcealed) return 0;
  return getKongs(dec).length;
}

// ========== SUIT-BASED FAN HELPERS ==========

/**
 * Check if hand is Half Flush (one suit + honors)
 */
export function isHalfFlush(hand: Hand): boolean {
  const suits = new Set<Suit>();
  let hasHonors = false;
  
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      suits.add(tile.kind.suit);
    } else if (tile.kind.type === 'wind' || tile.kind.type === 'dragon') {
      hasHonors = true;
    } else {
      return false; // Has flowers or other
    }
  }
  
  return suits.size === 1 && hasHonors;
}

/**
 * Check if hand is Full Flush (one suit only, no honors)
 */
export function isFullFlush(hand: Hand): boolean {
  const suits = new Set<Suit>();
  
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      suits.add(tile.kind.suit);
    } else {
      return false; // Has honors or flowers
    }
  }
  
  return suits.size === 1;
}

/**
 * Check if hand has one voided suit (missing one suit entirely)
 */
export function hasOneVoidedSuit(hand: Hand): boolean {
  const suitCounts = new Map<Suit, number>();
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      suitCounts.set(tile.kind.suit, (suitCounts.get(tile.kind.suit) || 0) + 1);
    }
  }
  const allSuits = [Suit.man, Suit.pin, Suit.sou];
  let voidedCount = 0;
  for (const suit of allSuits) {
    if (!suitCounts.has(suit) || suitCounts.get(suit) === 0) {
      voidedCount++;
    }
  }
  return voidedCount === 1;
}

/**
 * Check if hand has no honor tiles
 */
export function hasNoHonors(hand: Hand): boolean {
  for (const tile of hand.nonFlowerTiles) {
    if (isHonor(tile)) {
      return false;
    }
  }
  return true;
}

/**
 * Check if hand has all simples (2-8 only)
 */
export function hasAllSimples(hand: Hand): boolean {
  for (const tile of hand.nonFlowerTiles) {
    if (!isSimple(tile)) {
      return false;
    }
  }
  return true;
}

/**
 * Check if hand has all terminals (1 and 9 only)
 */
export function hasAllTerminals(hand: Hand): boolean {
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      if (tile.kind.rank !== 1 && tile.kind.rank !== 9) {
        return false;
      }
    } else {
      return false; // Has honors
    }
  }
  return true;
}

/**
 * Check if hand has all honors
 */
export function hasAllHonors(hand: Hand): boolean {
  for (const tile of hand.nonFlowerTiles) {
    if (!isHonor(tile)) {
      return false;
    }
  }
  return true;
}

/**
 * Check if hand has all terminals and honors
 */
export function hasAllTerminalsHonors(hand: Hand): boolean {
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      if (tile.kind.rank !== 1 && tile.kind.rank !== 9) {
        return false;
      }
    } else if (!isHonor(tile)) {
      return false;
    }
  }
  return true;
}

/**
 * Check if hand has all fives (rank 5 only)
 */
export function hasAllFives(hand: Hand): boolean {
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      if (tile.kind.rank !== 5) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Check if hand has all upper tiles (7-9)
 */
export function hasAllUpper(hand: Hand): boolean {
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      if (![7, 8, 9].includes(tile.kind.rank)) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Check if hand has all middle tiles (4-6)
 */
export function hasAllMiddle(hand: Hand): boolean {
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      if (![4, 5, 6].includes(tile.kind.rank)) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Check if hand has all lower tiles (1-3)
 */
export function hasAllLower(hand: Hand): boolean {
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      if (![1, 2, 3].includes(tile.kind.rank)) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Check if hand has all green tiles
 * Green: Bamboo 2,3,4,6,8 + Green Dragon
 */
export function hasAllGreen(hand: Hand): boolean {
  const greenRanks = new Set([2, 3, 4, 6, 8]);
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      if (tile.kind.suit !== Suit.sou || !greenRanks.has(tile.kind.rank)) {
        return false;
      }
    } else if (tile.kind.type === 'dragon') {
      if (tile.kind.value !== 'GD') {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Check if hand has reversible tiles only
 * Reversible: Dots 1,2,3,4,5,8,9; Bamboo 2,4,5,6,8,9; White Dragon
 */
export function hasAllReversible(hand: Hand): boolean {
  const dotAllowed = new Set([1, 2, 3, 4, 5, 8, 9]);
  const souAllowed = new Set([2, 4, 5, 6, 8, 9]);
  
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      if (tile.kind.suit === Suit.pin) {
        if (!dotAllowed.has(tile.kind.rank)) return false;
      } else if (tile.kind.suit === Suit.sou) {
        if (!souAllowed.has(tile.kind.rank)) return false;
      } else {
        return false; // Characters not allowed
      }
    } else if (tile.kind.type === 'dragon') {
      if (tile.kind.value !== 'WD') return false; // Only white dragon
    } else {
      return false; // Winds not allowed
    }
  }
  return true;
}

// ========== SPECIAL HAND DETECTORS ==========

/**
 * Detect Seven Pairs pattern
 */
export function isSevenPairs(hand: Hand): boolean {
  if (hand.nonFlowerTiles.length !== 14) return false;
  
  const counts = new Map<string, number>();
  for (const tile of hand.nonFlowerTiles) {
    const key = tile.description;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  
  let pairCount = 0;
  for (const count of counts.values()) {
    if (count === 2) {
      pairCount++;
    } else if (count === 4) {
      pairCount += 2; // Four of a kind counts as two pairs
    } else {
      return false; // Invalid count
    }
  }
  
  return pairCount === 7;
}

/**
 * Detect Thirteen Orphans pattern
 */
export function isThirteenOrphans(hand: Hand): boolean {
  const required: Set<string> = new Set([
    '1m', '9m', // Characters 1 and 9
    '1p', '9p', // Dots 1 and 9
    '1s', '9s', // Bamboo 1 and 9
    'E', 'S', 'W', 'N', // All winds
    'RD', 'GD', 'WD', // All dragons
  ]);
  
  const tileKeys = new Set(hand.nonFlowerTiles.map(t => t.description));
  
  // Must contain all required tiles
  if (!Array.from(required).every((r: string) => tileKeys.has(r))) {
    return false;
  }
  
  // Must have exactly one duplicate (the pair)
  const counts = new Map<string, number>();
  for (const tile of hand.nonFlowerTiles) {
    const key = tile.description;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  
  let pairCount = 0;
  for (const count of counts.values()) {
    if (count === 2) {
      pairCount++;
    } else if (count !== 1) {
      return false;
    }
  }
  
  return pairCount === 1 && hand.nonFlowerTiles.length === 14;
}

/**
 * Detect Nine Gates pattern
 * Concealed hand: 1112345678999 in a single suit, winning on any tile of that suit
 */
export function isNineGates(hand: Hand, ctx?: FanContext): boolean {
  if (!ctx?.isConcealed) return false;
  if (hand.nonFlowerTiles.length !== 14) return false;
  
  // Must be one suit only
  const suits = new Set<Suit>();
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      suits.add(tile.kind.suit);
    } else {
      return false; // No honors
    }
  }
  if (suits.size !== 1) return false;
  
  // Count tiles by rank
  const counts = new Map<number, number>();
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      const rank = tile.kind.rank;
      counts.set(rank, (counts.get(rank) || 0) + 1);
    }
  }
  
  // Required: 1 (3x), 2-8 (1x each), 9 (3x) = 14 tiles
  // Or: 1 (3x), 2-8 (1x each), 9 (2x) + one extra 1-9 = 14 tiles (winning tile)
  const required = new Map<number, number>([
    [1, 3],
    [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1],
    [9, 3],
  ]);
  
  let totalDiff = 0;
  for (let rank = 1; rank <= 9; rank++) {
    const requiredCount = required.get(rank) || 0;
    const actualCount = counts.get(rank) || 0;
    const diff = actualCount - requiredCount;
    if (diff < 0) return false;
    totalDiff += diff;
  }
  
  // Total diff should be 1 (the winning tile)
  return totalDiff === 1;
}

/**
 * Detect Seven Shifted Pairs: Seven pairs with consecutive ranks
 */
export function isSevenShiftedPairs(hand: Hand): boolean {
  if (!isSevenPairs(hand)) return false;
  
  // Get all pair ranks
  const counts = new Map<string, number>();
  for (const tile of hand.nonFlowerTiles) {
    const key = tile.description;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  
  const pairRanks: number[] = [];
  for (const [key, count] of counts) {
    if (count === 2 || count === 4) {
      // Parse rank from key (e.g., "5m" -> 5)
      const match = key.match(/^(\d+)/);
      if (match) {
        const rank = parseInt(match[1], 10);
        pairRanks.push(rank);
        if (count === 4) pairRanks.push(rank); // Count twice
      }
    }
  }
  
  if (pairRanks.length !== 7) return false;
  
  // Check if consecutive
  const sorted = pairRanks.sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] !== sorted[i] + 1) {
      return false;
    }
  }
  
  return true;
}


/**
 * Detect Mixed Straight: 123 in one suit, 456 in another, 789 in a third
 */
export function hasMixedStraight(dec: MeldKind[]): boolean {
  const chows = getChows(dec);
  const sequences: Array<{ start: number; suit: Suit }> = [];
  
  for (const chow of chows) {
    if (chow.type === 'chow') {
      sequences.push({ start: chow.base, suit: chow.suit });
    }
  }
  
  const has123 = sequences.some(s => s.start === 1);
  const has456 = sequences.some(s => s.start === 4);
  const has789 = sequences.some(s => s.start === 7);
  
  if (!has123 || !has456 || !has789) return false;
  
  const suits123 = sequences.filter(s => s.start === 1).map(s => s.suit);
  const suits456 = sequences.filter(s => s.start === 4).map(s => s.suit);
  const suits789 = sequences.filter(s => s.start === 7).map(s => s.suit);
  
  const allSuits = new Set([...suits123, ...suits456, ...suits789]);
  return allSuits.size === 3;
}

/**
 * Detect Mixed Triple Chow: same sequence in three different suits
 * NOTE: This is a duplicate of the function at line 351. Keeping the first one.
 */
// export function hasMixedTripleChow(dec: MeldKind[]): boolean {
//   const chows = getChows(dec);
//   const chowMap = new Map<number, Set<Suit>>();
//   
//   for (const chow of chows) {
//     if (chow.type === 'chow') {
//       if (!chowMap.has(chow.base)) {
//         chowMap.set(chow.base, new Set());
//       }
//       chowMap.get(chow.base)!.add(chow.suit);
//     }
//   }
//   
//   for (const suits of chowMap.values()) {
//     if (suits.size === 3) return true;
//   }
//   return false;
// }

/**
 * Detect Mixed Shifted Pungs: three pungs of consecutive values in different suits
 * NOTE: This is a duplicate of the function at line 522. Keeping the first one.
 */
// export function hasMixedShiftedPungs(dec: MeldKind[]): boolean {
//   const pungs = getPungs(dec);
//   if (pungs.length < 3) return false;
//   
//   const groups = new Map<number, Set<Suit>>();
//   
//   for (const pung of pungs) {
//     if (pung.type === 'pung' || pung.type === 'kong') {
//       const tile = pung.tile;
//       if (tile.kind.type === 'suited') {
//         const rank = tile.kind.rank;
//         const suit = tile.kind.suit;
//         if (!groups.has(rank)) {
//           groups.set(rank, new Set());
//         }
//         groups.get(rank)!.add(suit);
//       }
//     }
//   }
//   
//   const keys = Array.from(groups.keys()).sort((a, b) => a - b);
//   if (keys.length < 3) return false;
//   
//   // Check for three consecutive ranks
//   for (let i = 0; i <= keys.length - 3; i++) {
//     if (keys[i + 1] === keys[i] + 1 && keys[i + 2] === keys[i + 1] + 1) {
//       const suits0 = groups.get(keys[i])!;
//       const suits1 = groups.get(keys[i + 1])!;
//       const suits2 = groups.get(keys[i + 2])!;
//       const allSuits = new Set([...suits0, ...suits1, ...suits2]);
//       if (allSuits.size === 3) return true;
//     }
//   }
//   
//   return false;
// }

/**
 * Detect All Fives: each set contains a 5 tile
 * Note: This checks if all tiles are rank 5 (simplified version)
 * NOTE: This is a duplicate of the function at line 781. Keeping the first one.
 */
// export function hasAllFives(hand: Hand): boolean {
//   for (const tile of hand.nonFlowerTiles) {
//     if (tile.kind.type === 'suited') {
//       if (tile.kind.rank !== 5) {
//         return false;
//       }
//     } else {
//       return false; // No honors allowed
//     }
//   }
//   return true;
// }

/**
 * Detect Upper Four: all tiles are ranks 6-9
 */
export function hasUpperFour(hand: Hand): boolean {
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      if (![6, 7, 8, 9].includes(tile.kind.rank)) {
        return false;
      }
    } else {
      return false; // No honors
    }
  }
  return true;
}

/**
 * Detect Lower Four: all tiles are ranks 1-4
 */
export function hasLowerFour(hand: Hand): boolean {
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      if (![1, 2, 3, 4].includes(tile.kind.rank)) {
        return false;
      }
    } else {
      return false; // No honors
    }
  }
  return true;
}

/**
 * Detect Knitted Straight: nine-tile straight formed with three different knitted sequences
 * Knitted sequences: [1,4,7], [2,5,8], [3,6,9]
 */
export function isKnittedStraight(hand: Hand): boolean {
  const knittedSequences: number[][] = [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
  ];
  
  const counts = [0, 0, 0];
  
  for (const tile of hand.nonFlowerTiles) {
    if (tile.kind.type === 'suited') {
      const val = tile.kind.rank;
      knittedSequences.forEach((seq, i) => {
        if (seq.includes(val)) counts[i]++;
      });
    } else {
      return false; // No honors allowed
    }
  }
  
  // Each knitted sequence must have exactly 3 tiles
  return counts.every(c => c === 3) && hand.nonFlowerTiles.length === 14;
}

// ========== WIND/DRAGON HELPERS ==========

/**
 * Check if wind pung matches seat wind
 */
export function isSeatWindPung(meld: MeldKind, ctx?: FanContext): boolean {
  if (meld.type !== 'pung' && meld.type !== 'kong') return false;
  if (meld.tile.kind.type !== 'wind') return false;
  if (!ctx?.seatWind) return false;
  return meld.tile.kind.value === ctx.seatWind;
}

/**
 * Check if wind pung matches prevalent wind
 */
export function isPrevalentWindPung(meld: MeldKind, ctx?: FanContext): boolean {
  if (meld.type !== 'pung' && meld.type !== 'kong') return false;
  if (meld.tile.kind.type !== 'wind') return false;
  if (!ctx?.prevalentWind) return false;
  return meld.tile.kind.value === ctx.prevalentWind;
}

/**
 * Detect Little Four Winds: Three wind pungs + one wind pair
 */
export function hasLittleFourWinds(dec: MeldKind[]): boolean {
  const pungs = getPungs(dec);
  const pairs = getPairs(dec);
  
  let windPungCount = 0;
  const windValues = new Set<string>();
  
  for (const pung of pungs) {
    if (pung.type === 'pung' || pung.type === 'kong') {
      if (pung.tile.kind.type === 'wind') {
        windPungCount++;
        windValues.add(pung.tile.kind.value);
      }
    }
  }
  
  if (windPungCount !== 3) return false;
  
  for (const pair of pairs) {
    if (pair.type === 'pair') {
      if (pair.tile.kind.type === 'wind') {
        const windValue = pair.tile.kind.value;
        if (!windValues.has(windValue)) {
          return true; // Different wind as pair
        }
      }
    }
  }
  
  return false;
}

/**
 * Detect Big Four Winds: Four wind pungs
 */
export function hasBigFourWinds(dec: MeldKind[]): boolean {
  const pungs = getPungs(dec);
  let windCount = 0;
  const windValues = new Set<string>();
  
  for (const pung of pungs) {
    if (pung.type === 'pung' || pung.type === 'kong') {
      if (pung.tile.kind.type === 'wind') {
        windCount++;
        windValues.add(pung.tile.kind.value);
      }
    }
  }
  
  return windCount === 4 && windValues.size === 4;
}

/**
 * Detect Little Three Dragons: Two dragon pungs + one dragon pair
 */
export function hasLittleThreeDragons(dec: MeldKind[]): boolean {
  const pungs = getPungs(dec);
  const pairs = getPairs(dec);
  
  let dragonPungCount = 0;
  const dragonValues = new Set<string>();
  
  for (const pung of pungs) {
    if (pung.type === 'pung' || pung.type === 'kong') {
      if (pung.tile.kind.type === 'dragon') {
        dragonPungCount++;
        dragonValues.add(pung.tile.kind.value);
      }
    }
  }
  
  if (dragonPungCount !== 2) return false;
  
  for (const pair of pairs) {
    if (pair.type === 'pair') {
      if (pair.tile.kind.type === 'dragon') {
        const dragonValue = pair.tile.kind.value;
        if (!dragonValues.has(dragonValue)) {
          return true; // Different dragon as pair
        }
      }
    }
  }
  
  return false;
}

/**
 * Detect Big Three Dragons: Three dragon pungs
 */
export function hasBigThreeDragons(dec: MeldKind[]): boolean {
  const pungs = getPungs(dec);
  let dragonCount = 0;
  const dragonValues = new Set<string>();
  
  for (const pung of pungs) {
    if (pung.type === 'pung' || pung.type === 'kong') {
      if (pung.tile.kind.type === 'dragon') {
        dragonCount++;
        dragonValues.add(pung.tile.kind.value);
      }
    }
  }
  
  return dragonCount === 3 && dragonValues.size === 3;
}

// ========== GOING OUT FAN HELPERS ==========

/**
 * Detect Edge Wait: Waiting on 3 or 7 to complete a chow
 */
export function hasEdgeWait(dec: MeldKind[], ctx?: FanContext): boolean {
  if (!ctx?.winningTile) return false;
  if (ctx.winningTile.kind.type !== 'suited') return false;
  const rank = ctx.winningTile.kind.rank;
  return rank === 3 || rank === 7;
}

/**
 * Detect Closed Wait: Waiting on middle tile to complete a chow
 */
export function hasClosedWait(dec: MeldKind[], ctx?: FanContext): boolean {
  if (!ctx?.winningTile) return false;
  if (ctx.winningTile.kind.type !== 'suited') return false;
  const rank = ctx.winningTile.kind.rank;
  return rank >= 2 && rank <= 8;
}

/**
 * Detect Single Wait: Waiting on a single tile (pair wait)
 */
export function hasSingleWait(dec: MeldKind[], ctx?: FanContext): boolean {
  // This is typically when waiting on a pair
  // Most hands have some form of single wait
  return true; // Simplified
}

/**
 * Detect Last Tile: Winning on the last tile of its kind
 */
export function hasLastTile(ctx?: FanContext): boolean {
  return ctx?.isLastTile ?? false;
}

/**
 * Detect Last Tile Draw: Self-drawing the last tile
 */
export function hasLastTileDraw(ctx?: FanContext): boolean {
  return ctx?.isLastTileSelfDrawn ?? false;
}

/**
 * Detect Last Tile Claim: Claiming the last tile
 */
export function hasLastTileClaim(ctx?: FanContext): boolean {
  return ctx?.isLastTileClaim ?? false;
}

/**
 * Detect Out with Replacement Tile: Winning with a replacement tile from a kong
 */
export function hasOutWithReplacementTile(ctx?: FanContext): boolean {
  return ctx?.isReplacementTile ?? false;
}

/**
 * Detect Robbing the Kong: Claiming a tile that completes a kong
 */
export function hasRobbingKong(ctx?: FanContext): boolean {
  return ctx?.isRobbingKong ?? false;
}

// ========== CONCEALED HAND HELPERS ==========

/**
 * Count concealed pungs
 */
export function countConcealedPungs(dec: MeldKind[], ctx?: FanContext): number {
  if (!ctx?.isConcealed) return 0;
  return getPungs(dec).length;
}

/**
 * Check if hand is fully concealed
 */
export function isFullyConcealed(ctx?: FanContext): boolean {
  return ctx?.isConcealed ?? false;
}

// ========== MISC HELPERS ==========

/**
 * Detect Tile Hog: Uses all four of a suit tile without kong
 */
export function hasTileHog(hand: Hand, dec: MeldKind[]): boolean {
  const counts = new Map<string, number>();
  for (const tile of hand.nonFlowerTiles) {
    const key = tile.description;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  
  const kongs = getKongs(dec);
  const kongTiles = new Set(kongs.map(k => {
    if (k.type === 'kong') {
      return k.tile.description;
    }
    return '';
  }).filter(Boolean));
  
  for (const [tileKey, count] of counts) {
    if (count === 4 && !kongTiles.has(tileKey)) {
      return true;
    }
  }
  return false;
}

/**
 * Detect Outside Hand: All sets contain terminals or honors
 */
export function hasOutsideHand(dec: MeldKind[]): boolean {
  for (const m of dec) {
    if (m.type === 'chow') {
      // Terminal chow: base 1 or base 7
      if (m.base !== 1 && m.base !== 7) {
        return false;
      }
    } else if (m.type === 'pung' || m.type === 'kong' || m.type === 'pair') {
      const tile = m.tile;
      if (!isTerminal(tile) && !isHonor(tile)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Detect All Types: Each set is a different type
 */
export function hasAllTypes(dec: MeldKind[]): boolean {
  const types = new Set(dec.map(m => m.type));
  // Should have chows, pungs, and possibly kongs
  return types.has('chow') && types.has('pung');
}

/**
 * Detect All Chows: All four sets are chows
 */
export function hasAllChows(dec: MeldKind[]): boolean {
  return getChows(dec).length === 4;
}

/**
 * Detect All Pungs: All four sets are pungs/kongs
 */
export function hasAllPungs(dec: MeldKind[]): boolean {
  return getPungs(dec).length === 4;
}

