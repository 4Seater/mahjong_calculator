/**
 * Chinese Official Mahjong - Tile Models and Parsing
 */

export enum Suit {
  man = "m",  // characters
  pin = "p",  // dots
  sou = "s",  // bamboo
}

export type TileKind =
  | { type: 'suited'; rank: number; suit: Suit }  // 1...9
  | { type: 'wind'; value: string }   // "E","S","W","N"
  | { type: 'dragon'; value: string } // "RD","GD","WD" (red/green/white)
  | { type: 'flower'; index: number }; // optional flower index

export class Tile {
  public kind: TileKind;

  constructor(kind: TileKind) {
    this.kind = kind;
  }

  public get description(): string {
    switch (this.kind.type) {
      case 'suited':
        return `${this.kind.rank}${this.kind.suit}`;
      case 'wind':
        return this.kind.value;
      case 'dragon':
        return this.kind.value;
      case 'flower':
        return `F${this.kind.index}`;
    }
  }

  public equals(other: Tile): boolean {
    return this.description === other.description;
  }
}

export class TileParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TileParseError';
  }
}

/**
 * Parse a compact tile string like "1m" "9p" "3s" "E" "RD" "F1"
 */
export function parseTile(token: string): Tile {
  const t = token.trim();
  if (!t) throw new TileParseError(`Invalid token: ${token}`);

  // Winds
  const winds = ["E", "S", "W", "N"];
  if (winds.includes(t)) {
    return new Tile({ type: 'wind', value: t });
  }

  // Dragons
  const dragons = ["RD", "GD", "WD"];
  if (dragons.includes(t)) {
    return new Tile({ type: 'dragon', value: t });
  }

  // Flowers F1..F8
  if (t.startsWith("F")) {
    const idxStr = t.substring(1);
    const idx = parseInt(idxStr, 10);
    if (!isNaN(idx)) {
      return new Tile({ type: 'flower', index: idx });
    }
    throw new TileParseError(`Invalid flower token: ${token}`);
  }

  // Suited like "1m"
  if (t.length === 2) {
    const rankChar = t[0];
    const suitChar = t[1];
    const rank = parseInt(rankChar, 10);
    
    if (!isNaN(rank) && rank >= 1 && rank <= 9) {
      const suit = suitChar as Suit;
      if (Object.values(Suit).includes(suit)) {
        return new Tile({ type: 'suited', rank, suit });
      }
    }
  }

  throw new TileParseError(`Invalid token: ${token}`);
}

/**
 * Parse multiple tiles from a space-separated string
 */
export function parseTiles(input: string): Tile[] {
  const tokens = input.trim().split(/\s+/).filter(t => t.length > 0);
  const tiles: Tile[] = [];
  
  for (const token of tokens) {
    try {
      tiles.push(parseTile(token));
    } catch (e) {
      // Skip invalid tokens, but could log them
      console.warn(`Failed to parse tile: ${token}`, e);
    }
  }
  
  return tiles;
}

export class Hand {
  public tiles: Tile[];

  constructor(tiles: Tile[]) {
    this.tiles = tiles;
  }

  public get nonFlowerTiles(): Tile[] {
    return this.tiles.filter(t => t.kind.type !== 'flower');
  }

  public get flowerCount(): number {
    return this.tiles.filter(t => t.kind.type === 'flower').length;
  }
}

