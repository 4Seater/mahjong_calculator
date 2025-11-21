import { ChineseOfficialInput, ChineseOfficialResult, Fan, WinType, Player, HandResult } from './chineseOfficialTypes';
import { chineseOfficialFans } from './chineseOfficialFans';
import { calculateHandScore, playerIdToPlayer } from './chineseOfficial/scoringEngine';

/**
 * Chinese Official Mahjong Scoring Engine
 * 
 * Implements greedy selection strategy with rule resolution:
 * - Non-Repeat: Fans implied by chosen fans are skipped
 * - Non-Identical: Mutually exclusive fans are enforced
 * - Concealment requirements are checked
 */
export function computeChineseOfficial(
  input: ChineseOfficialInput
): ChineseOfficialResult {
  const allFansMap = new Map<string, Fan>();
  chineseOfficialFans.forEach(fan => {
    allFansMap.set(fan.id, fan);
  });

  // Start with candidates from UI selections
  const candidates: Fan[] = Array.from(input.selectedFanIDs)
    .map(id => allFansMap.get(id))
    .filter((fan): fan is Fan => fan !== undefined);

  // Filter out fans that require concealment but hand isn't concealed
  const validCandidates = candidates.filter(fan => {
    if (fan.requiresConcealed && !input.isConcealed) {
      return false;
    }
    return true;
  });

  // Sort descending by points for greedy selection
  validCandidates.sort((a, b) => b.points - a.points);

  const chosen: Fan[] = [];
  const chosenIDs = new Set<string>();

  // Greedy selection with non-repeat and incompatibility checks
  for (const fan of validCandidates) {
    // If fan is implied by any already chosen fan, skip (Non-Repeat)
    let isImplied = false;
    for (const chosenID of chosenIDs) {
      const chosenFan = allFansMap.get(chosenID);
      if (chosenFan && fan.impliedBy.has(chosenID)) {
        isImplied = true;
        break;
      }
    }
    if (isImplied) continue;

    // If fan incompatible with any chosen, skip
    let isIncompatible = false;
    for (const chosenID of chosenIDs) {
      if (fan.incompatibleWith.has(chosenID)) {
        isIncompatible = true;
        break;
      }
    }
    if (isIncompatible) continue;

    // Additional logic: if a going-out fan but winning method doesn't match, skip
    if (fan.isGoingOutFan) {
      if (fan.id === "selfDrawn" && !input.isSelfDraw) continue;
      if (fan.id === "fullyConcealedHand_selfDraw" && !input.isSelfDraw) continue;
      if (fan.id === "concealedHandWonByDiscard" && input.isSelfDraw) continue;
    }

    // Otherwise select it
    chosen.push(fan);
    chosenIDs.add(fan.id);
  }

  // Sum points + flowers
  const fanSum = chosen.reduce((sum, fan) => sum + fan.points, 0);
  const flowerPts = input.flowerCount; // 1 per flower
  const totalPoints = fanSum + flowerPts;

  // Use the new scoring engine for payment calculation
  const winType: WinType = input.isSelfDraw ? 'selfDraw' : 'discardWin';
  const discarderPlayer: Player | undefined = input.discarderId 
    ? playerIdToPlayer(input.discarderId) 
    : undefined;
  
  const handFans = chosen.map(fan => fan.points);
  const handResult = calculateHandScore(
    handFans,
    winType,
    discarderPlayer,
    flowerPts,
    chosen
  );

  // Convert HandResult paymentPerPlayer to payerMap (string IDs)
  const payerMap: Record<string, number> = {};
  let totalToWinner = 0;

  // If we have specific player IDs, use them; otherwise use Player names
  if (input.otherPlayerIds && input.otherPlayerIds.length >= 3) {
    // Use provided player IDs - map them to Player positions
    const allPlayerIds = [input.winnerId || 'East', ...input.otherPlayerIds];
    const playerOrder: Player[] = ['East', 'South', 'West', 'North'];
    
    playerOrder.forEach((player, index) => {
      if (index < allPlayerIds.length) {
        const playerId = allPlayerIds[index];
        const payment = handResult.paymentPerPlayer[player];
        payerMap[playerId] = payment;
        if (playerId !== input.winnerId) {
          totalToWinner += payment;
        }
      }
    });
  } else {
    // Use Player names as IDs
    Object.entries(handResult.paymentPerPlayer).forEach(([player, amount]) => {
      payerMap[player] = amount;
      if (player !== (input.winnerId || 'East')) {
        totalToWinner += amount;
      }
    });
  }

  // Create payouts array (for compatibility with existing structure)
  const payouts: number[] = [];
  if (input.winnerId) {
    payouts.push(-totalToWinner); // Winner receives (negative)
  }
  // Add other players' payments
  Object.values(payerMap).forEach(amount => {
    payouts.push(amount);
  });

  return {
    chosenFans: chosen,
    fanPointsSum: fanSum,
    flowerPoints: flowerPts,
    totalPoints: totalPoints,
    payouts: payouts,
    payerMap: payerMap,
    totalToWinner: totalToWinner,
    handResult: handResult, // Include HandResult for cleaner Player-based access
  };
}

/**
 * Get HandResult directly from Chinese Official input
 * This provides a cleaner interface using Player types
 */
export function getHandResult(input: ChineseOfficialInput): HandResult {
  const result = computeChineseOfficial(input);
  
  // Convert to HandResult format
  const winType: WinType = input.isSelfDraw ? 'selfDraw' : 'discardWin';
  const discarderPlayer: Player | undefined = input.discarderId 
    ? playerIdToPlayer(input.discarderId) 
    : undefined;
  
  const handFans = result.chosenFans.map(fan => fan.points);
  return calculateHandScore(
    handFans,
    winType,
    discarderPlayer,
    result.flowerPoints,
    result.chosenFans
  );
}

