/**
 * Fan Tracker - Prevents double-counting of sets (Non-Repeat/Non-Separation principle)
 * 
 * Tracks which sets (melds) have been used for fan detection to ensure
 * that the same set is not counted multiple times for different fans.
 */

import { Tile } from './tiles';
import { MeldKind } from './melds';
import { Suit } from './tiles';

/**
 * Represents a set of tiles (normalized for comparison)
 */
export type TileSet = {
  tiles: Tile[];
  normalizedKey: string;  // For quick comparison
};

/**
 * Fan Tracker class to prevent double-counting
 */
export class FanTracker {
  private usedSets: TileSet[] = [];

  /**
   * Convert a MeldKind to a TileSet
   */
  private meldToTileSet(meld: MeldKind): TileSet {
    const tiles: Tile[] = [];
    
    if (meld.type === 'chow') {
      // Chow: base, base+1, base+2 in same suit
      for (let i = 0; i < 3; i++) {
        const rank = meld.base + i;
        const tile = new Tile({ type: 'suited', rank, suit: meld.suit });
        tiles.push(tile);
      }
    } else if (meld.type === 'pung') {
      // Pung: 3 identical tiles
      for (let i = 0; i < 3; i++) {
        tiles.push(meld.tile);
      }
    } else if (meld.type === 'kong') {
      // Kong: 4 identical tiles
      for (let i = 0; i < 4; i++) {
        tiles.push(meld.tile);
      }
    } else if (meld.type === 'pair') {
      // Pair: 2 identical tiles
      for (let i = 0; i < 2; i++) {
        tiles.push(meld.tile);
      }
    }
    
    // Create normalized key for comparison
    const normalizedKey = this.normalizeTiles(tiles);
    
    return { tiles, normalizedKey };
  }

  /**
   * Normalize tiles to a string key for comparison
   * Sorts tiles by description to ensure consistent comparison
   */
  private normalizeTiles(tiles: Tile[]): string {
    const sorted = [...tiles]
      .map(t => t.description)
      .sort()
      .join(',');
    return sorted;
  }

  /**
   * Check if a set (meld) has already been used
   */
  public isUsed(meld: MeldKind): boolean {
    const set = this.meldToTileSet(meld);
    
    return this.usedSets.some(usedSet => {
      // Compare normalized keys
      if (usedSet.normalizedKey === set.normalizedKey) {
        return true;
      }
      
      // Also check if sets contain the same tiles (multiset comparison)
      return this.setsEqual(usedSet.tiles, set.tiles);
    });
  }

  /**
   * Check if two tile sets are equal (multiset comparison)
   */
  private setsEqual(tiles1: Tile[], tiles2: Tile[]): boolean {
    if (tiles1.length !== tiles2.length) return false;
    
    const counts1 = new Map<string, number>();
    const counts2 = new Map<string, number>();
    
    for (const tile of tiles1) {
      const key = tile.description;
      counts1.set(key, (counts1.get(key) || 0) + 1);
    }
    
    for (const tile of tiles2) {
      const key = tile.description;
      counts2.set(key, (counts2.get(key) || 0) + 1);
    }
    
    if (counts1.size !== counts2.size) return false;
    
    for (const [key, count] of Array.from(counts1)) {
      if (counts2.get(key) !== count) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Mark a set (meld) as used
   */
  public markUsed(meld: MeldKind): void {
    if (!this.isUsed(meld)) {
      const set = this.meldToTileSet(meld);
      this.usedSets.push(set);
    }
  }

  /**
   * Mark multiple sets as used
   */
  public markUsedMultiple(melds: MeldKind[]): void {
    for (const meld of melds) {
      this.markUsed(meld);
    }
  }

  /**
   * Check if any of the given melds are already used
   */
  public areAnyUsed(melds: MeldKind[]): boolean {
    return melds.some(meld => this.isUsed(meld));
  }

  /**
   * Get all unused melds from a decomposition
   */
  public getUnusedMelds(melds: MeldKind[]): MeldKind[] {
    return melds.filter(meld => !this.isUsed(meld));
  }

  /**
   * Clear all used sets (reset for new hand)
   */
  public reset(): void {
    this.usedSets = [];
  }

  /**
   * Get count of used sets
   */
  public getUsedCount(): number {
    return this.usedSets.length;
  }

  /**
   * Check if a specific fan pattern would use any already-used sets
   * This is used for Non-Separation principle checking
   */
  public wouldUseUsedSets(requiredMelds: MeldKind[]): boolean {
    return this.areAnyUsed(requiredMelds);
  }
}

