import { useMemo, useEffect } from 'react';
import { computeChineseOfficial } from '@/lib/scoring/chineseOfficialEngine';
import { OptimalScorer } from '@/lib/scoring/chineseOfficial/optimalSolver';
import { isValidHand, detectFans } from '@/lib/scoring/chineseOfficial/handValidator';
import type { Hand } from '@/lib/scoring/chineseOfficial/tiles';
import type { ChineseOfficialResult } from '@/lib/scoring/chineseOfficialTypes';
import type { ScoringOutcome } from '@/lib/scoring/chineseOfficial/optimalSolver';

interface UseChineseOfficialResultParams {
  mode: 'standard' | 'tournament' | 'chineseOfficial';
  inputMode: 'fanSelection' | 'tileInput';
  selectedFans: Set<string>;
  flowerCount: string;
  isSelfDraw: boolean;
  isConcealed: boolean;
  prevalentWindPung: boolean;
  seatWindPung: boolean;
  hand: Hand | null;
  winnerId?: string;
  discarderId?: string;
  otherPlayerIds?: string[];
  onOptimalResultChange?: (result: ScoringOutcome | null) => void;
  onDetectedFanIdsChange: (fanIds: string[]) => void;
  onSelectedFansChange: (fans: Set<string>) => void;
}

export function useChineseOfficialResult({
  mode,
  inputMode,
  selectedFans,
  flowerCount,
  isSelfDraw,
  isConcealed,
  prevalentWindPung,
  seatWindPung,
  hand,
  winnerId,
  discarderId,
  otherPlayerIds,
  onOptimalResultChange,
  onDetectedFanIdsChange,
  onSelectedFansChange,
}: UseChineseOfficialResultParams) {
  // Re-detect fans when hand or options change in Tile Input mode
  useEffect(() => {
    if (inputMode === 'tileInput' && hand) {
      const validation = isValidHand(hand);
      if (validation.isValid && validation.melds) {
        const detectedFans = detectFans(hand, validation.melds, {
          isConcealed,
          isSelfDraw,
          prevalentWindPungPresent: prevalentWindPung,
          seatWindPungPresent: seatWindPung,
        });
        onDetectedFanIdsChange(detectedFans);
        // Update selected fans to include newly detected ones (but keep user selections)
        const newSet = new Set(selectedFans);
        detectedFans.forEach(fanId => newSet.add(fanId));
        onSelectedFansChange(newSet);
      }
    }
  }, [
    inputMode,
    hand,
    isConcealed,
    isSelfDraw,
    prevalentWindPung,
    seatWindPung,
    selectedFans,
    onDetectedFanIdsChange,
    onSelectedFansChange,
  ]);

  // Chinese Official result calculation
  const result = useMemo<ChineseOfficialResult | null>(() => {
    if (mode !== "chineseOfficial") return null;
    
    // Use optimal solver if in tile input mode and hand is provided
    if (inputMode === 'tileInput' && hand) {
      const scorer = new OptimalScorer(otherPlayerIds ? otherPlayerIds.length + 1 : 4);
      const winnerIdx = winnerId ? (otherPlayerIds?.indexOf(winnerId) ?? 0) : 0;
      const discarderIdx = discarderId ? (otherPlayerIds?.indexOf(discarderId) ?? undefined) : undefined;
      
      const outcome = scorer.score(hand, {
        isSelfDraw,
        isConcealed,
        winnerIndex: winnerIdx,
        discarderIndex: discarderIdx,
        prevalentWindPungPresent: prevalentWindPung,
        seatWindPungPresent: seatWindPung,
      });
      
      onOptimalResultChange?.(outcome);
      
      // Convert to ChineseOfficialResult format
      const payerMap: Record<string, number> = {};
      let totalToWinner = 0;
      
      if (otherPlayerIds) {
        otherPlayerIds.forEach((id, idx) => {
          const payoutIdx = idx + 1; // +1 because winner is at index 0
          if (outcome.payouts[payoutIdx] > 0) {
            payerMap[id] = outcome.payouts[payoutIdx];
            totalToWinner += outcome.payouts[payoutIdx];
          }
        });
      }
      
      return {
        chosenFans: outcome.chosenFans,
        fanPointsSum: outcome.fanPoints,
        flowerPoints: outcome.flowerPoints,
        totalPoints: outcome.totalPoints,
        payouts: outcome.payouts,
        payerMap,
        totalToWinner,
      };
    }
    
    // Fall back to manual selection
    return computeChineseOfficial({
      selectedFanIDs: selectedFans,
      flowerCount: Number(flowerCount || 0),
      isSelfDraw,
      isConcealed,
      winningMethodIsDiscard: !isSelfDraw,
      prevalentWindPungPresent: prevalentWindPung,
      seatWindPungPresent: seatWindPung,
      discarderId: !isSelfDraw ? discarderId : undefined,
      winnerId,
      otherPlayerIds,
    });
  }, [
    mode,
    inputMode,
    selectedFans,
    flowerCount,
    isSelfDraw,
    isConcealed,
    prevalentWindPung,
    seatWindPung,
    hand,
    discarderId,
    winnerId,
    otherPlayerIds,
  ]);

  return result;
}

