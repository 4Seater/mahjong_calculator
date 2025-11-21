/**
 * Chinese Official Mahjong - Meld Types and Decomposition
 */

import { Tile, Hand } from './tiles';
import { Suit } from './tiles';

export type MeldKind =
  | { type: 'chow'; suit: Suit; base: number }   // base -> base,base+1,base+2
  | { type: 'pung'; tile: Tile }
  | { type: 'kong'; tile: Tile }
  | { type: 'pair'; tile: Tile };

/**
 * Enumerate all standard decompositions (4 sets + 1 pair)
 * Uses DFS backtracking to find all valid partitions
 */
export function enumerateStandardDecompositions(hand: Hand): MeldKind[][] {
  const tiles = [...hand.nonFlowerTiles];
  tiles.sort((a, b) => a.description.localeCompare(b.description));

  // Convert to multiset counts
  const counts = new Map<string, number>();
  for (const t of tiles) {
    counts.set(t.description, (counts.get(t.description) || 0) + 1);
  }

  const results: MeldKind[][] = [];
  const uniqueKeys = Array.from(new Set(tiles.map(t => t.description))).sort();

  for (const pairKey of uniqueKeys) {
    const pairCount = counts.get(pairKey) || 0;
    if (pairCount >= 2) {
      const countsCopy = new Map(counts);
      countsCopy.set(pairKey, pairCount - 2);
      
      const current: MeldKind[] = [{ 
        type: 'pair', 
        tile: parseTile(pairKey) 
      }];

      function backtrackPartition(countsLocal: Map<string, number>) {
        // Check if all counts are zero
        if (Array.from(countsLocal.values()).every(v => v === 0)) {
          if (current.length === 5) {
            results.push([...current]);
          }
          return;
        }

        // Find smallest key with count > 0
        const sortedKeys = Array.from(countsLocal.keys()).sort();
        const key = sortedKeys.find(k => (countsLocal.get(k) || 0) > 0);
        if (!key) return;

        const tile = parseTile(key);
        const count = countsLocal.get(key) || 0;

        // Try pung
        if (count >= 3) {
          countsLocal.set(key, count - 3);
          current.push({ type: 'pung', tile });
          backtrackPartition(countsLocal);
          current.pop();
          countsLocal.set(key, count);
        }

        // Try chow (only for suited tiles)
        if (tile.kind.type === 'suited' && tile.kind.rank <= 7) {
          const t2 = `${tile.kind.rank + 1}${tile.kind.suit}`;
          const t3 = `${tile.kind.rank + 2}${tile.kind.suit}`;
          const count2 = countsLocal.get(t2) || 0;
          const count3 = countsLocal.get(t3) || 0;

          if (count2 > 0 && count3 > 0) {
            countsLocal.set(key, count - 1);
            countsLocal.set(t2, count2 - 1);
            countsLocal.set(t3, count3 - 1);
            current.push({ 
              type: 'chow', 
              suit: tile.kind.suit, 
              base: tile.kind.rank 
            });
            backtrackPartition(countsLocal);
            current.pop();
            countsLocal.set(key, count);
            countsLocal.set(t2, count2);
            countsLocal.set(t3, count3);
          }
        }
      }

      backtrackPartition(countsCopy);
    }
  }

  return results;
}

import { parseTile } from './tiles';

/**
 * Detect Seven Pairs pattern
 */
export function detectSevenPairs(hand: Hand): boolean {
  const nonFlowers = hand.nonFlowerTiles;
  if (nonFlowers.length !== 14) return false;

  const counts = new Map<string, number>();
  for (const t of nonFlowers) {
    counts.set(t.description, (counts.get(t.description) || 0) + 1);
  }

  let pairs = 0;
  for (const count of counts.values()) {
    if (count === 2) {
      pairs += 1;
    } else if (count === 4) {
      pairs += 2;
    } else {
      return false;
    }
  }

  return pairs === 7;
}

/**
 * Detect Thirteen Orphans pattern
 */
export function detectThirteenOrphans(hand: Hand): boolean {
  const required = new Set([
    "1m", "9m", "1p", "9p", "1s", "9s",
    "E", "S", "W", "N", "RD", "GD", "WD"
  ]);

  const nonFlowers = new Set(hand.nonFlowerTiles.map(t => t.description));
  
  // Must contain all 13 unique tiles
  if (!Array.from(required).every(r => nonFlowers.has(r))) {
    return false;
  }

  // One of the required tiles must appear twice (pair)
  const counts = new Map<string, number>();
  for (const t of hand.nonFlowerTiles) {
    counts.set(t.description, (counts.get(t.description) || 0) + 1);
  }

  const hasPair = Array.from(required).some(r => (counts.get(r) || 0) >= 2);
  return hasPair && hand.nonFlowerTiles.length === 14;
}

/**
 * Detect Full Flush (one suit only, no honors)
 */
export function isFullFlush(hand: Hand): boolean {
  const nonFlowers = hand.nonFlowerTiles;
  if (nonFlowers.length === 0) return false;

  let suit: Suit | null = null;
  for (const t of nonFlowers) {
    if (t.kind.type === 'suited') {
      if (suit === null) {
        suit = t.kind.suit;
      } else if (suit !== t.kind.suit) {
        return false;
      }
    } else {
      // Honor present => not full flush
      return false;
    }
  }

  return suit !== null;
}

/**
 * Detect Half Flush (one suit + honors allowed)
 */
export function isHalfFlush(hand: Hand): boolean {
  const nonFlowers = hand.nonFlowerTiles;
  let suit: Suit | null = null;

  for (const t of nonFlowers) {
    if (t.kind.type === 'suited') {
      if (suit === null) {
        suit = t.kind.suit;
      } else if (suit !== t.kind.suit) {
        return false;
      }
    }
  }

  return suit !== null;
}

/**
 * Check if decomposition is all pungs/kongs
 */
export function isAllPungs(decompositions: MeldKind[][]): boolean {
  for (const dec of decompositions) {
    const pungs = dec.filter(m => m.type === 'pung' || m.type === 'kong');
    if (pungs.length === 4) {
      return true;
    }
  }
  return false;
}

// MARK: - Additional pattern detectors

/**
 * Check Pure Straight (three consecutive chows in same suit, i.e., 123+456+789 same suit)
 */
export function isPureStraight(dec: MeldKind[], hand: Hand): boolean {
  // Search dec for three chow melds in same suit with bases 1,4,7
  const chowBasesBySuit = new Map<Suit, Set<number>>();
  
  for (const m of dec) {
    if (m.type === 'chow') {
      const suit = m.suit;
      const base = m.base;
      if (!chowBasesBySuit.has(suit)) {
        chowBasesBySuit.set(suit, new Set());
      }
      chowBasesBySuit.get(suit)!.add(base);
    }
  }
  
  // Check for base 1,4,7 in same suit
  for (const [suit, bases] of chowBasesBySuit) {
    if (bases.has(1) && bases.has(4) && bases.has(7)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Mixed Straight (123 in one suit, 456 another, 789 third suit)
 */
export function isMixedStraight(dec: MeldKind[]): boolean {
  // We need bases 1,4,7 across three different suits (orderless)
  const map = new Map<number, Set<Suit>>();
  
  for (const m of dec) {
    if (m.type === 'chow') {
      const base = m.base;
      const suit = m.suit;
      if (!map.has(base)) {
        map.set(base, new Set());
      }
      map.get(base)!.add(suit);
    }
  }
  
  const b1 = map.get(1);
  const b4 = map.get(4);
  const b7 = map.get(7);
  
  if (!b1 || !b4 || !b7) return false;
  
  // Try picking one suit for each base so suits are distinct
  for (const s1 of b1) {
    for (const s4 of b4) {
      for (const s7 of b7) {
        if (new Set([s1, s4, s7]).size === 3) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Mixed Triple Chow (same numeric chow in each suit)
 */
export function isMixedTripleChow(dec: MeldKind[]): boolean {
  // Find a chow base b such that each suit has that chow
  const baseToSuits = new Map<number, Set<Suit>>();
  
  for (const m of dec) {
    if (m.type === 'chow') {
      const base = m.base;
      const suit = m.suit;
      if (!baseToSuits.has(base)) {
        baseToSuits.set(base, new Set());
      }
      baseToSuits.get(base)!.add(suit);
    }
  }
  
  for (const suits of baseToSuits.values()) {
    if (suits.size === 3) {
      return true;
    }
  }
  
  return false;
}

/**
 * Mixed Shifted Pungs (three pungs one in each suit shifted up one from last)
 */
export function isMixedShiftedPungs(dec: MeldKind[]): boolean {
  // Find pungs with ranks; want three pungs each in different suit, ranks r, r+1, r+2
  const rankSuitPairs: Array<[number, Suit]> = [];
  
  for (const m of dec) {
    if (m.type === 'pung' || m.type === 'kong') {
      const tile = m.tile;
      if (tile.kind.type === 'suited') {
        rankSuitPairs.push([tile.kind.rank, tile.kind.suit]);
      }
    }
  }
  
  if (rankSuitPairs.length < 3) return false;
  
  // Iterate all triplets
  const n = rankSuitPairs.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        const ranks = [rankSuitPairs[i][0], rankSuitPairs[j][0], rankSuitPairs[k][0]].sort((a, b) => a - b);
        const suits = new Set([rankSuitPairs[i][1], rankSuitPairs[j][1], rankSuitPairs[k][1]]);
        
        if (ranks[1] === ranks[0] + 1 && ranks[2] === ranks[1] + 1 && suits.size === 3) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Reversible Tiles detection per table definition
 */
export function isReversibleTiles(hand: Hand): boolean {
  // Reversible sets definition:
  // dots: 1,2,3,4,5,8,9
  // bamboo: 2,4,5,6,8,9
  // white dragon allowed
  const dotAllowed = new Set([1, 2, 3, 4, 5, 8, 9]);
  const souAllowed = new Set([2, 4, 5, 6, 8, 9]);
  
  for (const t of hand.nonFlowerTiles) {
    if (t.kind.type === 'suited') {
      const rank = t.kind.rank;
      const suit = t.kind.suit;
      
      if (suit === Suit.pin) {
        if (!dotAllowed.has(rank)) return false;
      } else if (suit === Suit.sou) {
        if (!souAllowed.has(rank)) return false;
      } else if (suit === Suit.man) {
        return false; // No characters allowed
      }
    } else if (t.kind.type === 'dragon') {
      if (t.kind.value !== "WD") return false; // only white dragon allowed
    } else if (t.kind.type === 'wind') {
      return false; // No winds allowed
    } else {
      return false;
    }
  }
  
  return true;
}

/**
 * Knitted Straight detection (nine tile straight formed with 3 knitted sequences)
 */
export function isKnittedStraight(hand: Hand): boolean {
  // Knitted sequences are triples of ranks separated by 3 (like 1,4,7).
  // A knitted straight needs 9 tiles that form 3 knitted sequences each of same offset across suits.
  const rankSet = new Set<number>();
  
  for (const t of hand.nonFlowerTiles) {
    if (t.kind.type === 'suited') {
      rankSet.add(t.kind.rank);
    } else {
      return false;
    }
  }
  
  // All nine must be present (1-9)
  const allRanks = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  return Array.from(allRanks).every(r => rankSet.has(r));
}

/**
 * All Fives
 */
export function isAllFives(hand: Hand): boolean {
  for (const t of hand.nonFlowerTiles) {
    if (t.kind.type === 'suited') {
      if (t.kind.rank !== 5) return false;
    } else {
      return false;
    }
  }
  return true;
}

/**
 * All Even Pungs (four pungs and a pair using only even numbers)
 */
export function isAllEvenPungs(decomps: MeldKind[][]): boolean {
  for (const dec of decomps) {
    const pungs = dec.filter(m => {
      if (m.type === 'pung' || m.type === 'kong') {
        const tile = m.tile;
        if (tile.kind.type === 'suited') {
          return tile.kind.rank % 2 === 0;
        }
      }
      return false;
    });
    
    if (pungs.length === 4) {
      // Pair must also be even-numbered suit
      const pair = dec.find(m => m.type === 'pair');
      if (pair && pair.tile.kind.type === 'suited') {
        if (pair.tile.kind.rank % 2 === 0) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Upper Tiles (7-9)
 */
export function isAllUpper(hand: Hand): boolean {
  for (const t of hand.nonFlowerTiles) {
    if (t.kind.type === 'suited') {
      if (![7, 8, 9].includes(t.kind.rank)) return false;
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Middle Tiles (4-6)
 */
export function isAllMiddle(hand: Hand): boolean {
  for (const t of hand.nonFlowerTiles) {
    if (t.kind.type === 'suited') {
      if (![4, 5, 6].includes(t.kind.rank)) return false;
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Lower Tiles (1-3)
 */
export function isAllLower(hand: Hand): boolean {
  for (const t of hand.nonFlowerTiles) {
    if (t.kind.type === 'suited') {
      if (![1, 2, 3].includes(t.kind.rank)) return false;
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Pure Shifted Chows detection: three chows in same suit shifted by 1 or 2 from the last
 */
export function isPureShiftedChows(dec: MeldKind[]): boolean {
  // Find chows in same suit; sort their bases, check differences all either +1 or +2 across
  const bySuit = new Map<Suit, number[]>();
  
  for (const m of dec) {
    if (m.type === 'chow') {
      const suit = m.suit;
      const base = m.base;
      if (!bySuit.has(suit)) {
        bySuit.set(suit, []);
      }
      bySuit.get(suit)!.push(base);
    }
  }
  
  for (const bases of bySuit.values()) {
    const b = bases.sort((a, b) => a - b);
    if (b.length >= 3) {
      // Check uniform shift by 1 or 2 (not mixed)
      const diffs: number[] = [];
      for (let i = 0; i < b.length - 1; i++) {
        diffs.push(b[i + 1] - b[i]);
      }
      const all1 = diffs.every(d => d === 1);
      const all2 = diffs.every(d => d === 2);
      if (all1 || all2) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Three Suited Terminal Chows detection: 123 & 789 in two suits and pair of 5s in third
 */
export function isThreeSuitedTerminalChows(dec: MeldKind[], hand: Hand): boolean {
  // Requires: in suit A: 123 & 789, in suit B: 123 & 789, pair of fives in suit C
  const has123 = new Set<Suit>();
  const has789 = new Set<Suit>();
  
  for (const m of dec) {
    if (m.type === 'chow') {
      const suit = m.suit;
      const base = m.base;
      if (base === 1) has123.add(suit);
      if (base === 7) has789.add(suit);
    }
  }
  
  // Find suits that have both 123 and 789
  const suitsWithBoth = new Set<Suit>();
  for (const s of has123) {
    if (has789.has(s)) {
      suitsWithBoth.add(s);
    }
  }
  
  if (suitsWithBoth.size >= 2) {
    // Now ensure pair of fives exists in third suit
    const fivePairsBySuit = new Set<Suit>();
    
    // Find pairs
    for (const m of dec) {
      if (m.type === 'pair') {
        const tile = m.tile;
        if (tile.kind.type === 'suited' && tile.kind.rank === 5) {
          fivePairsBySuit.add(tile.kind.suit);
        }
      }
    }
    
    // At least one suit different from the two suits with both should have pair of fives
    for (const s of fivePairsBySuit) {
      if (!suitsWithBoth.has(s)) {
        return true;
      }
    }
  }
  
  return false;
}

