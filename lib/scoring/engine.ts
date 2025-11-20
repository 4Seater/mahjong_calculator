import type {
  ScoreInput, ScoreResult,
  TournamentInput, TournamentResult
} from "./types";

/* ---------- STANDARD SCORER (your existing function) ---------- */
function sanitizeBase(n: number): number {
  if (!isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

/** 
 * NMJL Standard (money/settlement) scoring
 * 
 * Jokerless Rule (NMJL Official):
 * - When a player declares Mah Jongg and no Jokers are part of the hand 
 *   (even if jokers were exchanged from exposures earlier), the hand is jokerless.
 * - Jokerless + Discard win: Discarder pays 4× base, all other players pay 2× base
 * - Jokerless + Self-pick win: All players pay 4× base
 * - Exception: Singles and Pairs Group - jokerless bonus is built into the hand value, so no additional multipliers
 */
export function computeNmjlStandard(input: ScoreInput): ScoreResult {
  const base = sanitizeBase(input.basePoints || 0);
  const numPlayers = Math.max(2, input.numPlayers ?? 4);
  // Jokerless applies only if hand is jokerless AND not Singles and Pairs
  const jokerlessApplied = input.jokerless && !input.singlesAndPairs;

  // Calculate doubles multiplier using custom multipliers if provided
  let doublesMultiplier = 1;
  const customMults = input.customMultipliers || {};
  
  if (input.lastTileFromWall) {
    doublesMultiplier *= (customMults.lastTileFromWall ?? 2);
  }
  if (input.lastTileClaim) {
    doublesMultiplier *= (customMults.lastTileClaim ?? 2);
  }
  if (input.robbingTheJoker) {
    doublesMultiplier *= (customMults.robbingTheJoker ?? 2);
  }
  if (input.fourFlowers) {
    doublesMultiplier *= 2; // Four flowers always doubles
  }
  
  // Count doubles for display purposes
  let doublesCount = 0;
  if (input.lastTileFromWall) doublesCount++;
  if (input.lastTileClaim) doublesCount++;
  if (input.robbingTheJoker) doublesCount++;
  if (input.fourFlowers) doublesCount++;
  const totalDoubles = input.numDoubles ?? doublesCount;

  const rule: ScoreResult["rule"] = { 
    jokerlessApplied,
    misnamedJokerApplied: input.misnamedJoker && input.winType === "discard",
    doublesApplied: totalDoubles,
    eastDoubleApplied: input.eastDouble ?? false
  };
  
  // Check if jokerless uses points or multiplier
  const jokerlessUsesPoints = input.customPoints?.jokerless !== undefined;
  const jokerlessMultiplier = customMults.jokerless;
  
  if (input.winType === "self_pick") {
    // Self-pick: All players pay 2× (or custom multiplier if jokerless with multiplier mode)
    if (jokerlessUsesPoints) {
      // If jokerless is points-based, keep base multiplier
      rule.allMultiplier = 2;
    } else {
      rule.allMultiplier = jokerlessApplied && jokerlessMultiplier ? jokerlessMultiplier : (jokerlessApplied ? 4 : 2);
    }
  } else {
    // Discard win
    if (input.misnamedJoker) {
      rule.discarderMultiplier = customMults.misnamedJoker ?? 4;
      rule.otherMultiplier = 0;
      } else {
        // Discard payout: normal discard payout
        if (jokerlessUsesPoints) {
          rule.discarderMultiplier = 2;
          rule.otherMultiplier = 1;
        } else {
          if (jokerlessApplied) {
            if (jokerlessMultiplier) {
              // Use custom multiplier for discarder and others
              rule.discarderMultiplier = jokerlessMultiplier;
              rule.otherMultiplier = jokerlessMultiplier / 2; // Others pay half of discarder
            } else {
              // Default jokerless multipliers
              rule.discarderMultiplier = 4;
              rule.otherMultiplier = 2;
            }
          } else {
            rule.discarderMultiplier = 2;
            rule.otherMultiplier = 1;
          }
        }
      }
  }

  let perLoserAmounts: ScoreResult["perLoserAmounts"];
  if (rule.allMultiplier) {
    perLoserAmounts = { others: base * rule.allMultiplier };
  } else {
    perLoserAmounts = {
      discarder: base * (rule.discarderMultiplier ?? 0),
      others: base * (rule.otherMultiplier ?? 0),
    };
  }

  let totalToWinner: number;
  if (input.winType === "self_pick") {
    totalToWinner = (perLoserAmounts.others ?? 0) * (numPlayers - 1);
  } else {
    const otherCount = Math.max(0, numPlayers - 2);
    totalToWinner =
      (perLoserAmounts.discarder ?? 0) + (perLoserAmounts.others ?? 0) * otherCount;
  }

  // No-Exposures bonus handling
  const neb = input.noExposureBonus;
  const appliedNoExposureBonus: ScoreResult["appliedNoExposureBonus"] = { applied: false };

  if (input.noExposures && neb) {
    appliedNoExposureBonus.applied = true;
    appliedNoExposureBonus.mode = neb.mode;
    appliedNoExposureBonus.value = neb.value;

    if (neb.mode === "multiplier") {
      if (input.winType === "self_pick") {
        perLoserAmounts.others = Math.round((perLoserAmounts.others ?? 0) * neb.value);
        totalToWinner = (perLoserAmounts.others ?? 0) * (numPlayers - 1);
      } else {
        perLoserAmounts.discarder = Math.round((perLoserAmounts.discarder ?? 0) * neb.value);
        perLoserAmounts.others = Math.round((perLoserAmounts.others ?? 0) * neb.value);
        const otherCount = Math.max(0, numPlayers - 2);
        totalToWinner =
          (perLoserAmounts.discarder ?? 0) + (perLoserAmounts.others ?? 0) * otherCount;
      }
    } else {
      totalToWinner += Math.round(neb.value);
    }
  }

  // Jokerless bonus as points (if enabled)
  let jokerlessPointsBonus = 0;
  if (jokerlessUsesPoints && jokerlessApplied) {
    jokerlessPointsBonus = input.customPoints?.jokerless ?? 0;
    totalToWinner += jokerlessPointsBonus;
  }

  // Exposure penalty (optional house rule)
  let exposurePenalty = 0;
  if (input.exposurePenaltyPerExposure && input.exposurePenaltyPerExposure > 0) {
    const winnerExposures = input.winnerExposureCount ?? 0;
    exposurePenalty = winnerExposures * input.exposurePenaltyPerExposure;
    totalToWinner -= exposurePenalty; // Penalty reduces winner's total
  }

  // Apply doubles multiplier to all amounts
  if (doublesMultiplier > 1) {
    if (perLoserAmounts.others !== undefined) {
      perLoserAmounts.others = Math.round(perLoserAmounts.others * doublesMultiplier);
    }
    if (perLoserAmounts.discarder !== undefined) {
      perLoserAmounts.discarder = Math.round(perLoserAmounts.discarder * doublesMultiplier);
    }
    totalToWinner = Math.round(totalToWinner * doublesMultiplier);
    // Apply doubles to flat bonuses as well
    jokerlessPointsBonus = Math.round(jokerlessPointsBonus * doublesMultiplier);
    exposurePenalty = Math.round(exposurePenalty * doublesMultiplier);
  }

  // Apply custom rules
  let customRulesMultiplier = 1;
  let customRulesPoints = 0;
  if (input.customRules && input.customRules.length > 0) {
    input.customRules.forEach(rule => {
      if (rule.type === 'multiplier') {
        customRulesMultiplier *= rule.value;
      } else if (rule.type === 'points') {
        customRulesPoints += rule.value;
      }
    });
    
    if (customRulesMultiplier > 1) {
      if (perLoserAmounts.others !== undefined) {
        perLoserAmounts.others = Math.round(perLoserAmounts.others * customRulesMultiplier);
      }
      if (perLoserAmounts.discarder !== undefined) {
        perLoserAmounts.discarder = Math.round(perLoserAmounts.discarder * customRulesMultiplier);
      }
      totalToWinner = Math.round(totalToWinner * customRulesMultiplier);
      // Apply custom rules multiplier to flat bonuses as well
      jokerlessPointsBonus = Math.round(jokerlessPointsBonus * customRulesMultiplier);
      exposurePenalty = Math.round(exposurePenalty * customRulesMultiplier);
    }
    
    if (customRulesPoints > 0) {
      totalToWinner += customRulesPoints;
    }
  }
  
  // Track flat bonuses that need to be preserved (after multipliers are applied)
  const flatBonusAmount = jokerlessPointsBonus + customRulesPoints - exposurePenalty;
  // Also track no-exposure flat bonus if it was added
  const noExposureFlatBonus = (input.noExposures && neb && neb.mode === "flat") ? Math.round(neb.value * doublesMultiplier * customRulesMultiplier) : 0;

  // Determine if winner is East (for East's double rule)
  // Use explicit flag if provided, otherwise check winnerId
  const isEastWinner = input.isWinnerEast ?? (input.winnerId === "E" || input.winnerId === "East");
  
  const payerMap: Record<string, number> = {};
  
  if (input.winType === "self_pick") {
    const payEach = perLoserAmounts.others ?? 0;
    const ids = [
      ...(input.discarderId ? [input.discarderId] : []),
      ...(input.otherPlayerIds ?? []),
    ].filter(Boolean);
    ids.forEach((id) => {
      if (!id || id === input.winnerId) return;
      let amount = payEach;
      // Apply East's double: if East is winner, everyone pays double; if payer is East, they pay double
      if (input.eastDouble) {
        if (isEastWinner || id === "E" || id === "East") {
          amount = Math.round(amount * 2);
        }
      }
      payerMap[id] = (payerMap[id] || 0) + amount;
    });
  } else {
    if (input.discarderId) {
      let discarderAmount = perLoserAmounts.discarder ?? 0;
      // Apply East's double: if East is winner, discarder pays double; if discarder is East, they pay double
      if (input.eastDouble) {
        if (isEastWinner || input.discarderId === "E" || input.discarderId === "East") {
          discarderAmount = Math.round(discarderAmount * 2);
        }
      }
      payerMap[input.discarderId] = (payerMap[input.discarderId] || 0) + discarderAmount;
    }
    const payEachOther = (perLoserAmounts.others ?? 0);
    (input.otherPlayerIds ?? []).forEach((id) => {
      if (!id || id === input.winnerId || id === input.discarderId) return;
      let amount = payEachOther;
      // Apply East's double: if East is winner, others pay double; if payer is East, they pay double
      if (input.eastDouble) {
        if (isEastWinner || id === "E" || id === "East") {
          amount = Math.round(amount * 2);
        }
      }
      payerMap[id] = (payerMap[id] || 0) + amount;
    });
  }
  
  // Only recalculate totalToWinner from payerMap if East's double is enabled and payerMap has valid non-zero entries
  // Otherwise, keep the original calculation (which already includes all bonuses)
  if (input.eastDouble) {
    // Recalculate totalToWinner from payerMap after East's double is applied
    // Sum all positive amounts (what players pay to the winner)
    const baseTotalFromPayers = Object.values(payerMap).reduce((sum, amount) => sum + Math.max(0, amount), 0);
    
    // Only use recalculated value if payerMap has valid non-zero entries
    // If payerMap is empty or all values are 0, keep the original totalToWinner (which may include flat bonuses)
    if (baseTotalFromPayers > 0) {
      // payerMap has valid entries, use recalculated value
      totalToWinner = baseTotalFromPayers + flatBonusAmount + noExposureFlatBonus;
    }
    // If payerMap has 0 values, totalToWinner already has the correct value from above (including flat bonuses)
  }
  // If East's double is not enabled, totalToWinner already has the correct value from above
  
  if (input.winnerId) payerMap[input.winnerId] = -totalToWinner;

  return { 
    rule, 
    perLoserAmounts, 
    totalToWinner, 
    payerMap, 
    appliedNoExposureBonus,
    jokerlessPointsBonus,
    exposurePenalty
  };
}

/* ---------------------- TOURNAMENT SCORER ---------------------- */
/**
 * Tournament rules you specified:
 * - Winner gets basePoints (points = card value).
 * - +10 if self-pick.
 * - +20 if jokerless (except Singles & Pairs group).
 * - Wall game: +10 to each player (except dead players). If timeExpiredNoScore => all 0.
 * - If a hand is dead, player does not get +10 wall bonus.
 * - Penalty to discarder:
 *    - winner exposures 0 or 1 => discarder -10
 *    - winner exposures >= 2   => discarder -20
 * - False Mah Jongg:
 *    - If false MJ & 3 others exposed: all 0.
 *    - If false MJ & exactly 1 intact: that one gets +10, others 0.
 *    - If 2+ intact: game continues (no special scoring applied here).
 */
export function computeTournament(input: TournamentInput): TournamentResult {
  const {
    basePoints = 0,
    winType,
    winnerId,
    discarderId = null,
    playerIds,
    selfPick = false,
    jokerless = false,
    singlesAndPairs = false,
    winnerExposureCount = 0,
    isWallGame = false,
    timeExpiredNoScore = false,
    deadPlayerIds = [],
    falseMahjongAllExposed = false,
    falseMahjongOneIntactId = null
  } = input;

  const breakdown: string[] = [];
  const points: Record<string, number> = Object.fromEntries(playerIds.map(id => [id, 0]));

  const isPlayerDead = (id: string) => deadPlayerIds.includes(id);

  // Handle False Mah Jongg outcomes first (they override normal scoring)
  if (falseMahjongAllExposed) {
    breakdown.push("False MJ with all others exposed → everyone 0 points.");
    return { pointsByPlayer: points, breakdown };
  }
  if (falseMahjongOneIntactId) {
    for (const id of playerIds) points[id] = 0;
    if (playerIds.includes(falseMahjongOneIntactId)) {
      points[falseMahjongOneIntactId] = 10;
      breakdown.push(`False MJ; only ${falseMahjongOneIntactId} kept hand intact → +10 to that player; others 0.`);
    } else {
      breakdown.push("False MJ; one intact player not found in table → treated as all 0.");
    }
    return { pointsByPlayer: points, breakdown };
  }

  // Time expired rule
  if (timeExpiredNoScore) {
    for (const id of playerIds) points[id] = 0;
    breakdown.push("Time expired → all players 0 points.");
    return { pointsByPlayer: points, breakdown };
  }

  // Wall game
  if (isWallGame) {
    for (const id of playerIds) {
      if (!isPlayerDead(id)) points[id] += 10;
    }
    breakdown.push("Wall game → +10 to each non-dead player.");
    return { pointsByPlayer: points, breakdown };
  }

  // Otherwise: a valid win occurred
  if (!winnerId || !winType) {
    breakdown.push("No winner and not a wall/time-expired/false-MJ case → no changes.");
    return { pointsByPlayer: points, breakdown };
  }

  // Winner base points
  points[winnerId] += Math.max(0, Math.round(basePoints));
  breakdown.push(`Winner ${winnerId} gets base ${Math.round(basePoints)}.`);

  // +10 self-pick
  if (selfPick) {
    points[winnerId] += 10;
    breakdown.push("Self-pick bonus: +10.");
  }

  // +20 jokerless except Singles & Pairs
  const jokerlessBonusApplies = jokerless && !singlesAndPairs;
  if (jokerlessBonusApplies) {
    points[winnerId] += 20;
    breakdown.push("Jokerless bonus (not Singles & Pairs): +20.");
  } else if (jokerless && singlesAndPairs) {
    breakdown.push("Jokerless on Singles & Pairs → no bonus per rules.");
  }

  // Discarder penalties (only if win on discard)
  if (winType === "discard" && discarderId) {
    if (winnerExposureCount <= 1) {
      points[discarderId] -= 10;
      breakdown.push(`Discarder penalty: winner had ${winnerExposureCount} exposure(s) → ${discarderId} -10.`);
    } else {
      points[discarderId] -= 20;
      breakdown.push(`Discarder penalty: winner had ${winnerExposureCount} exposures → ${discarderId} -20.`);
    }
  }

  // Apply custom rules
  let customRulesMultiplier = 1;
  let customRulesPoints = 0;
  if (input.customRules && input.customRules.length > 0) {
    input.customRules.forEach(rule => {
      if (rule.type === 'multiplier') {
        customRulesMultiplier *= rule.value;
      } else if (rule.type === 'points') {
        customRulesPoints += rule.value;
      }
    });
    
    if (customRulesMultiplier > 1) {
      // Apply multiplier to all point values
      for (const id of playerIds) {
        points[id] = Math.round(points[id] * customRulesMultiplier);
      }
      breakdown.push(`Custom rules multiplier: ×${customRulesMultiplier} applied to all points.`);
    }
    
    if (customRulesPoints > 0 && winnerId) {
      // Add points to winner
      points[winnerId] += customRulesPoints;
      breakdown.push(`Custom rules points bonus: +${customRulesPoints} to winner.`);
    }
  }

  return { pointsByPlayer: points, breakdown };
}

