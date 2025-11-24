/**
 * Chinese Official Mahjong - Optimal Scoring Solver
 * 
 * Uses backtracking to find the maximum possible score under MCR rules
 * honoring Non-Repeat, Non-Identical, and Exclusionary constraints
 */

import { Hand } from './tiles';
import { 
  enumerateStandardDecompositions, 
  detectSevenPairs, 
  detectThirteenOrphans,
  isFullFlush,
  isHalfFlush,
  isAllPungs,
  isPureStraight,
  isMixedStraight,
  isMixedTripleChow,
  isMixedShiftedPungs,
  isReversibleTiles,
  isKnittedStraight,
  isAllFives,
  isAllEvenPungs,
  isAllUpper,
  isAllMiddle,
  isAllLower,
  isPureShiftedChows,
  isThreeSuitedTerminalChows,
  MeldKind
} from './melds';
import { Fan } from './chineseOfficialTypes';
import { chineseOfficialFans } from './chineseOfficialFans';

export interface ScoringOptions {
  isSelfDraw: boolean;
  isConcealed: boolean;
  winnerIndex: number;
  discarderIndex?: number; // nil if self-draw
  prevalentWindPungPresent: boolean;
  seatWindPungPresent: boolean;
}

export interface ScoringOutcome {
  chosenFans: Fan[];
  fanPoints: number;
  flowerPoints: number;
  totalPoints: number;
  payouts: number[]; // positive = pay; winner receives sum as negative
}

export class OptimalScorer {
  private players: number;

  constructor(players: number = 4) {
    this.players = players;
  }

  /**
   * Main scoring entry point
   */
  public score(hand: Hand, options: ScoringOptions): ScoringOutcome {
    // Gather decompositions
    const decomps = enumerateStandardDecompositions(hand);
    const candidateFanSets: Fan[][] = [];

    // Detect special-hand patterns
    if (detectThirteenOrphans(hand)) {
      const fan = chineseOfficialFans.find(f => f.id === "thirteenOrphans");
      if (fan) {
        candidateFanSets.push([fan]);
      }
    }

    if (detectSevenPairs(hand)) {
      const fan = chineseOfficialFans.find(f => f.id === "sevenPairs");
      if (fan) {
        candidateFanSets.push([fan]);
      }
    }

    // For each decomposition, detect all applicable fans
    for (const dec of decomps) {
      const applicable: Fan[] = [];

      // Tile-level patterns
      if (isAllPungs([dec])) {
        const f = chineseOfficialFans.find(f => f.id === "allPungs");
        if (f) applicable.push(f);
      }

      // Half/Full flush
      if (isFullFlush(hand)) {
        const f = chineseOfficialFans.find(f => f.id === "fullFlush");
        if (f) applicable.push(f);
      } else if (isHalfFlush(hand)) {
        const f = chineseOfficialFans.find(f => f.id === "halfFlush");
        if (f) applicable.push(f);
      }

      // Pattern-based fans using new detectors
      if (isPureStraight(dec, hand)) {
        const f = chineseOfficialFans.find(f => f.id === "pureStraight");
        if (f) applicable.push(f);
      }
      
      if (isMixedStraight(dec)) {
        const f = chineseOfficialFans.find(f => f.id === "mixedStraight");
        if (f) applicable.push(f);
      }
      
      if (isMixedTripleChow(dec)) {
        const f = chineseOfficialFans.find(f => f.id === "mixedTripleChow");
        if (f) applicable.push(f);
      }
      
      if (isMixedShiftedPungs(dec)) {
        const f = chineseOfficialFans.find(f => f.id === "mixedShiftedPungs");
        if (f) applicable.push(f);
      }
      
      if (isPureShiftedChows(dec)) {
        const f = chineseOfficialFans.find(f => f.id === "pureShiftedChows");
        if (f) applicable.push(f);
      }
      
      if (isKnittedStraight(hand)) {
        const f = chineseOfficialFans.find(f => f.id === "knittedStraight");
        if (f) applicable.push(f);
      }
      
      if (isReversibleTiles(hand)) {
        const f = chineseOfficialFans.find(f => f.id === "reversibleTiles");
        if (f) applicable.push(f);
      }
      
      if (isAllFives(hand)) {
        const f = chineseOfficialFans.find(f => f.id === "allFives");
        if (f) applicable.push(f);
      }
      
      if (isAllUpper(hand)) {
        const f = chineseOfficialFans.find(f => f.id === "upperTiles");
        if (f) applicable.push(f);
      }
      
      if (isAllMiddle(hand)) {
        const f = chineseOfficialFans.find(f => f.id === "middleTiles");
        if (f) applicable.push(f);
      }
      
      if (isAllLower(hand)) {
        const f = chineseOfficialFans.find(f => f.id === "lowerTiles");
        if (f) applicable.push(f);
      }
      
      // All-even-pungs uses decompositions
      if (isAllEvenPungs([dec])) {
        const f = chineseOfficialFans.find(f => f.id === "allEvenPungs");
        if (f) applicable.push(f);
      }
      
      // Three-suited terminal chows
      if (isThreeSuitedTerminalChows(dec, hand)) {
        const f = chineseOfficialFans.find(f => f.id === "threeSuitedTerminalChows");
        if (f) applicable.push(f);
      }

      // Concealed/pair based
      if (options.isConcealed && options.isSelfDraw) {
        const f = chineseOfficialFans.find(f => f.id === "fullyConcealedHand_selfDraw");
        if (f) applicable.push(f);
      } else if (options.isConcealed && !options.isSelfDraw) {
        const f = chineseOfficialFans.find(f => f.id === "concealedHandWonByDiscard");
        if (f) applicable.push(f);
      }

      // Detect kongs
      const kongCount = dec.filter(m => m.type === 'kong').length;
      if (kongCount >= 1) {
        const f = chineseOfficialFans.find(f => f.id === "meldedKong");
        if (f) applicable.push(f);
      }
      if (kongCount >= 2) {
        const f = chineseOfficialFans.find(f => f.id === "twoKongs");
        if (f) applicable.push(f);
      }
      if (kongCount >= 3) {
        const f = chineseOfficialFans.find(f => f.id === "threeKongs");
        if (f) applicable.push(f);
      }
      if (kongCount >= 4) {
        const f = chineseOfficialFans.find(f => f.id === "fourKongs");
        if (f) applicable.push(f);
      }

      // Detect pungs of dragons/winds
      for (const m of dec) {
        if (m.type === 'pung') {
          const tile = m.tile;
          if (tile.kind.type === 'dragon') {
            const f = chineseOfficialFans.find(f => f.id === "dragonPung");
            if (f && !applicable.find(a => a.id === f.id)) applicable.push(f);
          } else if (tile.kind.type === 'wind') {
            // Seat/prevalent wind logic
            if (options.prevalentWindPungPresent) {
              const f = chineseOfficialFans.find(f => f.id === "prevalentWindPung");
              if (f && !applicable.find(a => a.id === f.id)) applicable.push(f);
            }
            if (options.seatWindPungPresent) {
              const f = chineseOfficialFans.find(f => f.id === "seatWindPung");
              if (f && !applicable.find(a => a.id === f.id)) applicable.push(f);
            }
          }
        }
      }

      // Add going-out fans
      if (options.isSelfDraw) {
        const f = chineseOfficialFans.find(f => f.id === "selfDrawn");
        if (f && !applicable.find(a => a.id === f.id)) applicable.push(f);
      }

      candidateFanSets.push(applicable);
    }

    // Also include empty set if nothing detected
    if (candidateFanSets.length === 0) {
      candidateFanSets.push([]);
    }

    // For each candidate set, compute best subset under implied/incompat constraints
    let bestTotal = -1;
    let bestFans: Fan[] = [];

    for (const fans of candidateFanSets) {
      const result = this.bestSubset(fans, options, hand.flowerCount);
      if (result.totalPoints > bestTotal) {
        bestTotal = result.totalPoints;
        bestFans = result.chosen;
      }
    }

    // Compute payouts
    const flowerPts = hand.flowerCount;
    const fanSum = bestFans.reduce((sum, f) => sum + f.points, 0);
    const total = fanSum + flowerPts;

    const payouts = new Array(this.players).fill(0);

    if (options.isSelfDraw) {
      const perOpp = total + 8;
      for (let p = 0; p < this.players; p++) {
        if (p === options.winnerIndex) continue;
        payouts[p] = perOpp;
      }
      const sumRec = payouts.reduce((sum, p) => sum + p, 0);
      payouts[options.winnerIndex] = -sumRec;
    } else {
      const discarder = options.discarderIndex ?? ((options.winnerIndex + 1) % this.players);
      for (let p = 0; p < this.players; p++) {
        if (p === options.winnerIndex) continue;
        if (p === discarder) {
          payouts[p] = total + 8;
        } else {
          payouts[p] = 8;
        }
      }
      const sumRec = payouts.reduce((sum, p) => sum + p, 0);
      payouts[options.winnerIndex] = -sumRec;
    }

    return {
      chosenFans: bestFans,
      fanPoints: fanSum,
      flowerPoints: flowerPts,
      totalPoints: total,
      payouts: payouts,
    };
  }

  /**
   * Given a list of candidate fans, find highest-scoring valid subset
   * Uses backtracking to explore all valid combinations
   */
  private bestSubset(
    fans: Fan[],
    options: ScoringOptions,
    flowerCount: number
  ): { chosen: Fan[]; totalPoints: number } {
    let bestSum = -1;
    let bestSet: Fan[] = [];
    const n = fans.length;

    function backtrack(
      idx: number,
      chosen: Fan[],
      chosenIDs: Set<string>,
      sum: number
    ) {
      if (idx === n) {
        const total = sum + flowerCount;
        if (total > bestSum) {
          bestSum = total;
          bestSet = [...chosen];
        }
        return;
      }

      // Option: skip idx
      backtrack(idx + 1, chosen, chosenIDs, sum);

      // Option: include idx if valid
      const cand = fans[idx];

      // Reject if requiresConcealed but not provided
      if (cand.requiresConcealed && !options.isConcealed) {
        return;
      }

      // Reject if any chosen fan implies this one (non-repeat)
      let isImplied = false;
      for (const chosenID of chosenIDs) {
        if (cand.impliedBy.has(chosenID)) {
          isImplied = true;
          break;
        }
      }
      if (isImplied) return;

      // Reject if any chosen is incompatible with this
      let isIncompatible = false;
      for (const chosenID of chosenIDs) {
        if (cand.incompatibleWith.has(chosenID)) {
          isIncompatible = true;
          break;
        }
      }
      if (isIncompatible) return;

      // Reject if this fan is incompatible with any chosen
      for (const chosenID of chosenIDs) {
        const chosenFan = fans.find(f => f.id === chosenID);
        if (chosenFan && chosenFan.incompatibleWith.has(cand.id)) {
          return;
        }
      }

      // Include
      chosen.push(cand);
      chosenIDs.add(cand.id);
      backtrack(idx + 1, chosen, chosenIDs, sum + cand.points);
      chosen.pop();
      chosenIDs.delete(cand.id);
    }

    backtrack(0, [], new Set(), 0);

    return {
      chosen: bestSet,
      totalPoints: Math.max(bestSum, 0),
    };
  }
}

