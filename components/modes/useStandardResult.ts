import { useMemo } from 'react';
import { computeNmjlStandard } from '@/lib/scoring/engine';
import type { WinType, NoExposureBonusConfig } from '@/lib/scoring/types';
import type { CustomRule } from '@/lib/storage/customRulesStorage';

interface UseStandardResultParams {
  basePoints: string;
  winType: WinType;
  jokerless: boolean;
  singlesAndPairs: boolean;
  numPlayers: number;
  noExposures: boolean;
  misnamedJoker: boolean;
  heavenlyHand: boolean;
  wallGame: boolean;
  kittyEnabled: boolean;
  kittyPayout: string;
  displayMode: 'currency' | 'points';
  winnerId?: string;
  discarderId?: string;
  otherPlayerIds?: string[];
  exposurePenaltyEnabled: boolean;
  exposurePenaltyPerExposure: string;
  standardWinnerExposureCount: string;
  lastTileFromWall: boolean;
  lastTileClaim: boolean;
  robbingTheJoker: boolean;
  eastDouble: boolean;
  isWinnerEast: boolean;
  selectedCustomRuleIds: Set<string>;
  customRules: CustomRule[];
  customRuleValues: Record<string, { type: 'multiplier' | 'points', value: number }>;
}

export function useStandardResult({
  basePoints,
  winType,
  jokerless,
  singlesAndPairs,
  numPlayers,
  noExposures,
  misnamedJoker,
  heavenlyHand,
  wallGame,
  kittyEnabled,
  kittyPayout,
  displayMode,
  winnerId,
  discarderId,
  otherPlayerIds,
  exposurePenaltyEnabled,
  exposurePenaltyPerExposure,
  standardWinnerExposureCount,
  lastTileFromWall,
  lastTileClaim,
  robbingTheJoker,
  eastDouble,
  isWinnerEast,
  selectedCustomRuleIds,
  customRules,
  customRuleValues,
}: UseStandardResultParams) {
  // Build config object for bonus (or omit it entirely if not enabled)
  const noExposureBonus: NoExposureBonusConfig | undefined =
    noExposures
      ? ({
          mode: customRuleValues.noExposures?.type === 'points' ? 'flat' : 'multiplier',
          value: customRuleValues.noExposures?.value ?? 2, // Default ×2
        } as NoExposureBonusConfig)
      : undefined;

  const result = useMemo(() => {
    return computeNmjlStandard({
      basePoints: Number(basePoints || 0),
      winType,
      jokerless,
      singlesAndPairs,
      numPlayers,
      noExposures,
      noExposureBonus,
      misnamedJoker,
      heavenlyHand,
      wallGame,
      kittyEnabled,
      kittyPayout: (kittyEnabled || (displayMode === 'points' && wallGame)) ? Number(kittyPayout || 10) : 0,
      displayMode,
      winnerId,
      discarderId,
      otherPlayerIds,
      exposurePenaltyPerExposure: exposurePenaltyEnabled ? Number(exposurePenaltyPerExposure || 0) : 0,
      winnerExposureCount: Number(standardWinnerExposureCount || 0),
      lastTileFromWall,
      lastTileClaim,
      robbingTheJoker,
      eastDouble,
      isWinnerEast,
      customMultipliers: {
        jokerless: customRuleValues.jokerless?.type === 'multiplier' ? customRuleValues.jokerless.value : undefined,
        misnamedJoker: customRuleValues.misnamedJoker?.type === 'multiplier' ? customRuleValues.misnamedJoker.value : undefined,
        heavenlyHand: customRuleValues.heavenlyHand?.type === 'multiplier' ? customRuleValues.heavenlyHand.value : undefined,
        lastTileFromWall: customRuleValues.lastTileFromWall?.type === 'multiplier' ? customRuleValues.lastTileFromWall.value : undefined,
        lastTileClaim: customRuleValues.lastTileClaim?.type === 'multiplier' ? customRuleValues.lastTileClaim.value : undefined,
        robbingTheJoker: customRuleValues.robbingTheJoker?.type === 'multiplier' ? customRuleValues.robbingTheJoker.value : undefined,
      },
      customPoints: {
        jokerless: customRuleValues.jokerless?.type === 'points' ? customRuleValues.jokerless.value : undefined,
      },
      customRules: Array.from(selectedCustomRuleIds).map(id => {
        const rule = customRules.find(r => r.id === id);
        if (!rule) return null;
        
        // Return rule in new format (winnerBonus, discarderPenalty, allPlayerPenalty)
        // The scoring engine handles both new and legacy formats
        return {
          id: rule.id,
          winnerBonus: rule.winnerBonus,
          discarderPenalty: rule.discarderPenalty,
          allPlayerPenalty: rule.allPlayerPenalty,
          // Legacy format support
          type: rule.type,
          value: rule.value,
        };
      }).filter(Boolean) as Array<{
        id: string;
        winnerBonus?: { type: 'points' | 'multiplier'; value: number };
        discarderPenalty?: { enabled: boolean; type: 'points' | 'multiplier'; value: number };
        allPlayerPenalty?: { enabled: boolean; type: 'points' | 'multiplier'; value: number };
        type?: 'multiplier' | 'points' | 'opponentDeduction' | 'discarderDeduction';
        value?: number;
      }>
    });
  }, [
    basePoints,
    winType,
    jokerless,
    singlesAndPairs,
    numPlayers,
    noExposures,
    misnamedJoker,
    heavenlyHand,
    wallGame,
    kittyEnabled,
    kittyPayout,
    winnerId,
    discarderId,
    otherPlayerIds,
    exposurePenaltyEnabled,
    exposurePenaltyPerExposure,
    standardWinnerExposureCount,
    lastTileFromWall,
    lastTileClaim,
    robbingTheJoker,
    eastDouble,
    isWinnerEast,
    selectedCustomRuleIds,
    customRules,
    customRuleValues,
    noExposureBonus,
  ]);

  return result;
}

