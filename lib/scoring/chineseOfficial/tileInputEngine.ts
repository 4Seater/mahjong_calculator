/**
 * Chinese Official Mahjong - Manual Tile Input Engine
 * 
 * Provides a structured way to add/remove tiles with validation
 */

import { Tile, Hand, parseTile, TileParseError } from './tiles';

export interface TileInputState {
  tiles: Tile[];
  errorMessage: string | null;
  isValid: boolean;
}

export class TileInputEngine {
  private tiles: Tile[] = [];
  private errorMessage: string | null = null;
  private readonly maxTileCount = 14; // Excluding flowers
  private readonly maxTileCopies = 4;

  /**
   * Get current state
   */
  getState(): TileInputState {
    return {
      tiles: [...this.tiles],
      errorMessage: this.errorMessage,
      isValid: this.validateHand(),
    };
  }

  /**
   * Get current tiles
   */
  getTiles(): Tile[] {
    return [...this.tiles];
  }

  /**
   * Get non-flower tiles (for validation)
   */
  getNonFlowerTiles(): Tile[] {
    return this.tiles.filter(t => t.kind.type !== 'flower');
  }

  /**
   * Get flower count
   */
  getFlowerCount(): number {
    return this.tiles.filter(t => t.kind.type === 'flower').length;
  }

  /**
   * Add a tile to the hand
   */
  addTile(tile: Tile): { success: boolean; error?: string } {
    // Check if adding exceeds max tile copies (for non-flowers)
    if (tile.kind.type !== 'flower') {
      const count = this.tiles.filter(t => t.equals(tile)).length;
      if (count >= this.maxTileCopies) {
        this.errorMessage = `Cannot have more than ${this.maxTileCopies} of the same tile.`;
        return { success: false, error: this.errorMessage };
      }
    }

    // Check if hand exceeds max tile count (excluding flowers)
    const nonFlowerTiles = this.getNonFlowerTiles();
    if (tile.kind.type !== 'flower' && nonFlowerTiles.length >= this.maxTileCount) {
      this.errorMessage = `Hand cannot exceed ${this.maxTileCount} tiles (excluding flowers).`;
      return { success: false, error: this.errorMessage };
    }

    this.tiles.push(tile);
    this.errorMessage = null;
    return { success: true };
  }

  /**
   * Remove a tile by index
   */
  removeTileByIndex(index: number): boolean {
    if (index >= 0 && index < this.tiles.length) {
      this.tiles.splice(index, 1);
      this.errorMessage = null;
      return true;
    }
    return false;
  }

  /**
   * Remove a specific tile (removes first occurrence)
   */
  removeTile(tile: Tile): boolean {
    const index = this.tiles.findIndex(t => t.equals(tile));
    if (index >= 0) {
      this.tiles.splice(index, 1);
      this.errorMessage = null;
      return true;
    }
    return false;
  }

  /**
   * Get count of a specific tile
   */
  getTileCount(tile: Tile): number {
    return this.tiles.filter(t => t.equals(tile)).length;
  }

  /**
   * Validate the hand
   */
  validateHand(): boolean {
    const nonFlowerTiles = this.getNonFlowerTiles();
    
    // Must have exactly 14 non-flower tiles
    if (nonFlowerTiles.length !== this.maxTileCount) {
      this.errorMessage = `Hand must contain exactly ${this.maxTileCount} tiles (excluding flowers). Currently: ${nonFlowerTiles.length}`;
      return false;
    }

    // Check for duplicate tiles (max 4 of each)
    const tileCounts = new Map<string, number>();
    for (const tile of nonFlowerTiles) {
      const key = tile.description;
      const count = (tileCounts.get(key) || 0) + 1;
      tileCounts.set(key, count);
      
      if (count > this.maxTileCopies) {
        this.errorMessage = `Tile ${tile.description} appears too many times (max ${this.maxTileCopies}).`;
        return false;
      }
    }

    this.errorMessage = null;
    return true;
  }

  /**
   * Clear all tiles
   */
  resetHand(): void {
    this.tiles = [];
    this.errorMessage = null;
  }

  /**
   * Create a Hand object from current tiles
   */
  createHand(): Hand {
    return new Hand([...this.tiles]);
  }

  /**
   * Get error message
   */
  getErrorMessage(): string | null {
    return this.errorMessage;
  }
}

/**
 * Generate all available tiles for manual selection
 */
export function getAllAvailableTiles(): Tile[] {
  const tiles: Tile[] = [];

  // Suited tiles (1-9 for each suit)
  const suits = ['m', 'p', 's'] as const;
  for (const suit of suits) {
    for (let rank = 1; rank <= 9; rank++) {
      tiles.push(new Tile({ type: 'suited', rank, suit }));
    }
  }

  // Winds
  const winds = ['E', 'S', 'W', 'N'];
  for (const wind of winds) {
    tiles.push(new Tile({ type: 'wind', value: wind }));
  }

  // Dragons
  const dragons = ['RD', 'GD', 'WD'];
  for (const dragon of dragons) {
    tiles.push(new Tile({ type: 'dragon', value: dragon }));
  }

  // Flowers (F1-F8)
  for (let i = 1; i <= 8; i++) {
    tiles.push(new Tile({ type: 'flower', index: i }));
  }

  return tiles;
}

/**
 * Get tile display name for UI
 */
export function getTileDisplayName(tile: Tile): string {
  switch (tile.kind.type) {
    case 'suited':
      const suitNames: Record<string, string> = {
        'm': 'Man',
        'p': 'Pin',
        's': 'Sou',
      };
      return `${tile.kind.rank}${suitNames[tile.kind.suit] || tile.kind.suit}`;
    case 'wind':
      const windNames: Record<string, string> = {
        'E': 'East',
        'S': 'South',
        'W': 'West',
        'N': 'North',
      };
      return windNames[tile.kind.value] || tile.kind.value;
    case 'dragon':
      const dragonNames: Record<string, string> = {
        'RD': 'Red Dragon',
        'GD': 'Green Dragon',
        'WD': 'White Dragon',
      };
      return dragonNames[tile.kind.value] || tile.kind.value;
    case 'flower':
      return `Flower ${tile.kind.index}`;
  }
}

