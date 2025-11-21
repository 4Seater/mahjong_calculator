/**
 * Chinese Official Mahjong Scoring Engine
 * 
 * Handles:
 * - Hand evaluation → calculates fan/points based on rules
 * - Win type → Self-Draw (Zimo) or Discard Win (Ron)
 * - Payment calculation → who pays how much
 */

import { WinType, Player, HandResult, Fan } from '../chineseOfficialTypes';
import { fanPoints, getFanPointsByName } from '../chineseOfficialFans';

const BASE_POINTS = 8; // Basic points everyone pays

/**
 * Calculate hand score and payment distribution
 * 
 * @param handFans Array of fan point values for the hand (or fan names as strings)
 * @param winType Self-Draw or Discard Win
 * @param discarder Player who discarded the winning tile (only for discardWin)
 * @param flowerCount Number of flowers in the hand
 * @param chosenFans Array of Fan objects that were selected/detected
 * @returns HandResult with total points and payment per player
 */
export function calculateHandScore(
  handFans: number[] | string[],
  winType: WinType,
  discarder?: Player,
  flowerCount: number = 0,
  chosenFans: Fan[] = []
): HandResult {
  // Convert fan names to points if needed
  const fanPointsArray: number[] = handFans.map(f => {
    if (typeof f === 'string') {
      return getFanPointsByName(f);
    }
    return f;
  });
  
  // Sum all fan points
  const fanPointsSum = fanPointsArray.reduce((sum, f) => sum + f, 0);
  const totalPoints = fanPointsSum + flowerCount;

  // Initialize payment map for all players
  const paymentPerPlayer: Record<Player, number> = {
    East: 0,
    South: 0,
    West: 0,
    North: 0,
  };

  if (winType === 'selfDraw') {
    // Self-Draw: Everyone pays the full hand value + base points
    Object.keys(paymentPerPlayer).forEach((p) => {
      paymentPerPlayer[p as Player] = totalPoints + BASE_POINTS;
    });
  } else if (winType === 'discardWin') {
    // Discard Win: Only discarder pays extra + base points, others pay base points
    const discarderPlayer = discarder || 'East'; // Default to East if not specified
    
    Object.keys(paymentPerPlayer).forEach((p) => {
      const player = p as Player;
      if (player === discarderPlayer) {
        paymentPerPlayer[player] = totalPoints + BASE_POINTS;
      } else {
        paymentPerPlayer[player] = BASE_POINTS;
      }
    });
  }

  return {
    totalPoints,
    paymentPerPlayer,
    chosenFans,
    fanPointsSum,
    flowerPoints: flowerCount,
  };
}

/**
 * Convert player string ID to Player type
 */
export function playerIdToPlayer(playerId: string): Player {
  // Map common player ID formats to Player type
  const idUpper = playerId.toUpperCase();
  if (idUpper === 'E' || idUpper === 'EAST' || idUpper.startsWith('EAST')) {
    return 'East';
  }
  if (idUpper === 'S' || idUpper === 'SOUTH' || idUpper.startsWith('SOUTH')) {
    return 'South';
  }
  if (idUpper === 'W' || idUpper === 'WEST' || idUpper.startsWith('WEST')) {
    return 'West';
  }
  if (idUpper === 'N' || idUpper === 'NORTH' || idUpper.startsWith('NORTH')) {
    return 'North';
  }
  // Default to East if unknown
  return 'East';
}

/**
 * Convert Player type to player string ID
 */
export function playerToPlayerId(player: Player): string {
  return player;
}

