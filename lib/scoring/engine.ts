import type {
  ScoreInput, ScoreResult,
  TournamentInput, TournamentResult
} from "./types";

/* ---------- STANDARD SCORER (your existing function) ---------- */
function sanitizeBase(n: number): number {
  if (!isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

/** NMJL Standard (money/settlement) — UNCHANGED from earlier message */
export function computeNmjlStandard(input: ScoreInput): ScoreResult {
  const base = sanitizeBase(input.basePoints || 0);
  const numPlayers = Math.max(2, input.numPlayers ?? 4);
  const jokerlessApplied = input.jokerless && !input.singlesAndPairs;

  const rule: ScoreResult["rule"] = { 
    jokerlessApplied,
    misnamedJokerApplied: input.misnamedJoker && input.winType === "discard"
  };
  if (input.winType === "self_pick") {
    rule.allMultiplier = jokerlessApplied ? 4 : 2;
  } else {
    if (input.misnamedJoker) {
      rule.discarderMultiplier = 4;
      rule.otherMultiplier = 0;
    } else {
      rule.discarderMultiplier = jokerlessApplied ? 4 : 2;
      rule.otherMultiplier = jokerlessApplied ? 2 : 1;
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

  // No-Exposures bonus handling (from prior message)
  const neb = input.noExposureBonus;
  const appliedNoExposureBonus: ScoreResult["appliedNoExposureBonus"] = { applied: false, suppressed: false };
  const shouldSuppress =
    !!neb?.suppressOnConcealedOnly && !!input.isCardHandConcealedOnly;

  if (input.noExposures && neb && !shouldSuppress) {
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
  } else if (input.noExposures && neb && shouldSuppress) {
    appliedNoExposureBonus.suppressed = true;
  }

  const payerMap: Record<string, number> = {};
  if (input.winnerId) payerMap[input.winnerId] = -totalToWinner;
  if (input.winType === "self_pick") {
    const payEach = perLoserAmounts.others ?? 0;
    const ids = [
      ...(input.discarderId ? [input.discarderId] : []),
      ...(input.otherPlayerIds ?? []),
    ].filter(Boolean);
    ids.forEach((id) => {
      if (!id || id === input.winnerId) return;
      payerMap[id] = (payerMap[id] || 0) + payEach;
    });
  } else {
    if (input.discarderId) {
      payerMap[input.discarderId] =
        (payerMap[input.discarderId] || 0) + (perLoserAmounts.discarder ?? 0);
    }
    const payEachOther = (perLoserAmounts.others ?? 0);
    (input.otherPlayerIds ?? []).forEach((id) => {
      if (!id || id === input.winnerId || id === input.discarderId) return;
      payerMap[id] = (payerMap[id] || 0) + payEachOther;
    });
  }

  return { rule, perLoserAmounts, totalToWinner, payerMap, appliedNoExposureBonus };
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

  return { pointsByPlayer: points, breakdown };
}

