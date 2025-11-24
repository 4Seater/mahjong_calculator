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
  // If wall game is enabled, no wins are possible - return zero result
  if (input.wallGame) {
    const rule: ScoreResult["rule"] = {
      jokerlessApplied: false,
      misnamedJokerApplied: false,
      heavenlyHandApplied: false,
      wallGameApplied: true,
      kittyApplied: Boolean(input.displayMode === 'points' || (input.kittyPayout && input.kittyPayout > 0)),
      doublesApplied: 0,
      eastDoubleApplied: false
    };
    
    // Handle points/kitty based on display mode
    let kittyPerPlayer = 0;
    let kittyTotalPayout = 0;
    let totalToWinner = 0;
    const numPlayers = Math.max(2, input.numPlayers ?? 4);
    const isPointsMode = input.displayMode === 'points';
    
    if (isPointsMode) {
      // Points mode: all players are awarded points (default 10 if no kitty amount specified)
      kittyPerPlayer = input.kittyPayout && input.kittyPayout > 0 ? input.kittyPayout : 10;
      totalToWinner = kittyPerPlayer; // Each player gets this amount
      kittyTotalPayout = kittyPerPlayer * numPlayers; // All players awarded
    } else {
      // Currency mode: only if kitty is enabled, players pay to kitty
      if (input.kittyPayout && input.kittyPayout > 0) {
        kittyPerPlayer = input.kittyPayout;
        totalToWinner = 0; // Players are paying, not receiving
        kittyTotalPayout = kittyPerPlayer * numPlayers; // All players pay
      }
    }
    
    return {
      rule,
      perLoserAmounts: { others: 0, discarder: 0 },
      totalToWinner: totalToWinner,
      payerMap: {},
      kittyPayout: kittyTotalPayout,
      kittyPerPlayer: kittyPerPlayer,
      appliedNoExposureBonus: { applied: false },
      jokerlessPointsBonus: 0,
      exposurePenalty: 0,
    };
  }
  
  const base = sanitizeBase(input.basePoints || 0);
  const numPlayers = Math.max(2, input.numPlayers ?? 4);
  
  // Heavenly Hand: always treated as self-pick
  const effectiveWinType = input.heavenlyHand ? "self_pick" : input.winType;
  
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
    misnamedJokerApplied: input.misnamedJoker && effectiveWinType === "discard",
    heavenlyHandApplied: input.heavenlyHand ?? false,
      wallGameApplied: Boolean(input.wallGame),
    kittyApplied: Boolean(input.kittyPayout && input.kittyPayout > 0),
    doublesApplied: totalDoubles,
    eastDoubleApplied: input.eastDouble ?? false
  };
  
  // Check if jokerless uses points or multiplier
  const jokerlessUsesPoints = input.customPoints?.jokerless !== undefined;
  const jokerlessMultiplier = customMults.jokerless;
  
  if (effectiveWinType === "self_pick") {
    // Self-pick: All players pay 2× (or custom multiplier if jokerless with multiplier mode)
    if (jokerlessUsesPoints) {
      // If jokerless is points-based, keep base multiplier
      rule.allMultiplier = 2;
    } else {
      rule.allMultiplier = jokerlessApplied && jokerlessMultiplier ? jokerlessMultiplier : (jokerlessApplied ? 4 : 2);
    }
  } else {
    // Discard win
    // Note: misnamed joker is handled later after all multipliers are applied
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
  if (effectiveWinType === "self_pick") {
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
      if (effectiveWinType === "self_pick") {
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
  let opponentDeductionPoints = 0;
  let discarderDeductionPoints = 0;
  let opponentDeductionMultiplier = 1;
  let discarderDeductionMultiplier = 1;
  
  if (input.customRules && input.customRules.length > 0) {
    input.customRules.forEach(rule => {
      // New format: winnerBonus, discarderPenalty, allPlayerPenalty
      if (rule.winnerBonus) {
        if (rule.winnerBonus.type === 'multiplier') {
          customRulesMultiplier *= rule.winnerBonus.value;
        } else if (rule.winnerBonus.type === 'points') {
          customRulesPoints += rule.winnerBonus.value;
        }
      }
      if (rule.discarderPenalty?.enabled) {
        if (rule.discarderPenalty.type === 'points') {
          discarderDeductionPoints += rule.discarderPenalty.value;
        } else {
          discarderDeductionMultiplier *= rule.discarderPenalty.value;
        }
      }
      if (rule.allPlayerPenalty?.enabled) {
        if (rule.allPlayerPenalty.type === 'points') {
          opponentDeductionPoints += rule.allPlayerPenalty.value;
        } else {
          opponentDeductionMultiplier *= rule.allPlayerPenalty.value;
        }
      }
      
      // Legacy format support (all legacy penalties are points)
      if (rule.type === 'multiplier' && rule.value) {
        customRulesMultiplier *= rule.value;
      } else if (rule.type === 'points' && rule.value) {
        customRulesPoints += rule.value;
      } else if (rule.type === 'opponentDeduction' && rule.value) {
        opponentDeductionPoints += rule.value;
      } else if (rule.type === 'discarderDeduction' && rule.value) {
        discarderDeductionPoints += rule.value;
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
  
  // Apply Heavenly Hand: custom multiplier (default 2×) payout from all players
  const heavenlyHandMultiplier = input.heavenlyHand ? (input.customMultipliers?.heavenlyHand ?? 2) : 1;
  if (input.heavenlyHand) {
    if (perLoserAmounts.others !== undefined) {
      perLoserAmounts.others = Math.round(perLoserAmounts.others * heavenlyHandMultiplier);
    }
    if (perLoserAmounts.discarder !== undefined) {
      perLoserAmounts.discarder = Math.round(perLoserAmounts.discarder * heavenlyHandMultiplier);
    }
    totalToWinner = Math.round(totalToWinner * heavenlyHandMultiplier);
    // Apply to flat bonuses as well
    jokerlessPointsBonus = Math.round(jokerlessPointsBonus * heavenlyHandMultiplier);
    exposurePenalty = Math.round(exposurePenalty * heavenlyHandMultiplier);
  }

  // Apply Misnamed Joker: discarder pays custom multiplier (default 4×) of the final winner's score
  // This must be applied AFTER all other multipliers (doubles, custom rules, heavenly hand, etc.)
  // Others still pay their normal amount
  // The discarder's payment REPLACES the normal discarder payment, it doesn't add to it
  // Note: Misnamed joker only applies to discard wins (not self-pick, and not heavenly hand which is treated as self-pick)
  if (input.misnamedJoker && effectiveWinType === "discard") {
    const misnamedJokerMultiplier = customMults.misnamedJoker ?? 4;
    // totalToWinner currently includes: normalDiscarderAmount + (others × otherCount)
    // We want discarder to pay 4× totalToWinner, replacing the normal discarder amount
    // So: new_totalToWinner = 4×totalToWinner + (others × otherCount) - normalDiscarderAmount
    // But that's circular. Instead, we calculate:
    // winnerScore = what winner gets with normal payments = totalToWinner (current value)
    // discarder pays 4× winnerScore (replacing normal payment)
    // new totalToWinner = 4×winnerScore + othersTotal
    const otherCount = Math.max(0, numPlayers - 2);
    const othersTotal = (perLoserAmounts.others ?? 0) * otherCount;
    // The winner's score (what they would receive with normal discarder payment)
    const winnerScore = totalToWinner;
    // Discarder pays multiplier × the winner's total score (replacing normal payment)
    perLoserAmounts.discarder = Math.round(winnerScore * misnamedJokerMultiplier);
    // Others keep their normal amount (already calculated in perLoserAmounts.others)
    // Recalculate totalToWinner: new discarder amount + (others amount × otherCount)
    totalToWinner = perLoserAmounts.discarder + othersTotal;
  }

  // Track flat bonuses that need to be preserved (after multipliers are applied)
  const flatBonusAmount = jokerlessPointsBonus + customRulesPoints - exposurePenalty;
  // Also track no-exposure flat bonus if it was added
  const noExposureFlatBonus = (input.noExposures && neb && neb.mode === "flat") ? Math.round(neb.value * doublesMultiplier * customRulesMultiplier * heavenlyHandMultiplier) : 0;

  // Determine if winner is East (for East's double rule)
  // Use explicit flag if provided, otherwise check winnerId
  const isEastWinner = input.isWinnerEast ?? (input.winnerId === "E" || input.winnerId === "East");
  
  const payerMap: Record<string, number> = {};
  
  if (effectiveWinType === "self_pick") {
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
  
  // Apply custom rule deductions (points and multipliers)
  // Apply point deductions
  if (opponentDeductionPoints > 0 || discarderDeductionPoints > 0) {
    // Apply opponent point deductions to all non-discarder players
    if (opponentDeductionPoints > 0) {
      Object.keys(payerMap).forEach((id) => {
        if (id !== input.discarderId && id !== input.winnerId) {
          payerMap[id] = Math.max(0, payerMap[id] - opponentDeductionPoints);
        }
      });
    }
    
    // Apply discarder point deduction to discarder only
    if (discarderDeductionPoints > 0 && input.discarderId) {
      if (payerMap[input.discarderId] !== undefined) {
        payerMap[input.discarderId] = Math.max(0, payerMap[input.discarderId] - discarderDeductionPoints);
      }
    }
  }
  
  // Apply multiplier deductions (reduce payment by multiplying)
  if (opponentDeductionMultiplier !== 1 || discarderDeductionMultiplier !== 1) {
    // Apply opponent multiplier deductions to all non-discarder players
    if (opponentDeductionMultiplier !== 1) {
      Object.keys(payerMap).forEach((id) => {
        if (id !== input.discarderId && id !== input.winnerId) {
          payerMap[id] = Math.round(payerMap[id] * opponentDeductionMultiplier);
        }
      });
    }
    
    // Apply discarder multiplier deduction to discarder only
    if (discarderDeductionMultiplier !== 1 && input.discarderId) {
      if (payerMap[input.discarderId] !== undefined) {
        payerMap[input.discarderId] = Math.round(payerMap[input.discarderId] * discarderDeductionMultiplier);
      }
    }
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
  
  // Apply Kitty payout
  // In currency mode: all players pay to kitty (deducted)
  // In points mode: all players are awarded points (added)
  let kittyPerPlayer = 0;
  let kittyTotalPayout = 0;
  if (input.kittyPayout && input.kittyPayout > 0) {
    kittyPerPlayer = input.kittyPayout;
    const isPointsMode = input.displayMode === 'points';
    
    if (isPointsMode) {
      // Points mode: all players are awarded the points (added to their score)
      // This doesn't affect the winner's payout calculation, just tracked for display
      kittyTotalPayout = kittyPerPlayer * numPlayers; // All players awarded
    } else {
      // Currency mode: all players pay to kitty (deducted)
      // Deduct from all players in payerMap (losers)
      Object.keys(payerMap).forEach((id) => {
        if (payerMap[id] > 0) {
          payerMap[id] = Math.max(0, payerMap[id] - kittyPerPlayer);
          kittyTotalPayout += kittyPerPlayer;
        }
      });
      // Also deduct from winner's total (they receive less)
      totalToWinner = Math.max(0, totalToWinner - kittyPerPlayer);
      kittyTotalPayout += kittyPerPlayer; // Winner also pays
    }
  }
  
  if (input.winnerId) payerMap[input.winnerId] = -totalToWinner;

  return { 
    rule, 
    perLoserAmounts, 
    totalToWinner, 
    payerMap,
    kittyPayout: kittyTotalPayout,
    kittyPerPlayer: kittyPerPlayer, 
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
  let opponentDeductionPoints = 0;
  let discarderDeductionPoints = 0;
  let opponentDeductionMultiplier = 1;
  let discarderDeductionMultiplier = 1;
  
  if (input.customRules && input.customRules.length > 0) {
    input.customRules.forEach(rule => {
      // New format: winnerBonus, discarderPenalty, allPlayerPenalty
      if (rule.winnerBonus) {
        if (rule.winnerBonus.type === 'multiplier') {
          customRulesMultiplier *= rule.winnerBonus.value;
        } else if (rule.winnerBonus.type === 'points') {
          customRulesPoints += rule.winnerBonus.value;
        }
      }
      if (rule.discarderPenalty?.enabled) {
        if (rule.discarderPenalty.type === 'points') {
          discarderDeductionPoints += rule.discarderPenalty.value;
        } else {
          discarderDeductionMultiplier *= rule.discarderPenalty.value;
        }
      }
      if (rule.allPlayerPenalty?.enabled) {
        if (rule.allPlayerPenalty.type === 'points') {
          opponentDeductionPoints += rule.allPlayerPenalty.value;
        } else {
          opponentDeductionMultiplier *= rule.allPlayerPenalty.value;
        }
      }
      
      // Legacy format support (all legacy penalties are points)
      if (rule.type === 'multiplier' && rule.value) {
        customRulesMultiplier *= rule.value;
      } else if (rule.type === 'points' && rule.value) {
        customRulesPoints += rule.value;
      } else if (rule.type === 'opponentDeduction' && rule.value) {
        opponentDeductionPoints += rule.value;
      } else if (rule.type === 'discarderDeduction' && rule.value) {
        discarderDeductionPoints += rule.value;
      }
    });
    
    if (customRulesMultiplier > 1 && winnerId) {
      // Apply multiplier only to winner's score (multipliers increase what the winner receives)
      points[winnerId] = Math.round(points[winnerId] * customRulesMultiplier);
      breakdown.push(`Custom rules multiplier: ×${customRulesMultiplier} applied to winner's score.`);
    }
    
    if (customRulesPoints > 0 && winnerId) {
      // Add points to winner
      points[winnerId] += customRulesPoints;
      breakdown.push(`Custom rules points bonus: +${customRulesPoints} to winner.`);
    }
    
    // Apply opponent point deductions (all other players except winner and discarder)
    if (opponentDeductionPoints > 0) {
      playerIds.forEach((id) => {
        if (id !== winnerId && id !== discarderId) {
          points[id] -= opponentDeductionPoints;
        }
      });
      breakdown.push(`Custom rule: -${opponentDeductionPoints} points to all other players.`);
    }
    
    // Apply opponent multiplier deductions
    if (opponentDeductionMultiplier !== 1) {
      playerIds.forEach((id) => {
        if (id !== winnerId && id !== discarderId) {
          points[id] = Math.round(points[id] * opponentDeductionMultiplier);
        }
      });
      breakdown.push(`Custom rule: ×${opponentDeductionMultiplier} multiplier to all other players.`);
    }
    
    // Apply discarder point deduction
    if (discarderDeductionPoints > 0 && discarderId) {
      points[discarderId] -= discarderDeductionPoints;
      breakdown.push(`Custom rule: ${discarderId} -${discarderDeductionPoints} points (discarder penalty).`);
    }
    
    // Apply discarder multiplier deduction
    if (discarderDeductionMultiplier !== 1 && discarderId) {
      points[discarderId] = Math.round(points[discarderId] * discarderDeductionMultiplier);
      breakdown.push(`Custom rule: ${discarderId} ×${discarderDeductionMultiplier} multiplier (discarder penalty).`);
    }
  }

  return { pointsByPlayer: points, breakdown };
}

