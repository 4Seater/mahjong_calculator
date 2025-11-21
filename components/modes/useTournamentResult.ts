import { useMemo } from 'react';
import { computeTournament } from '@/lib/scoring/engine';
import type { CustomRule } from '@/lib/storage/customRulesStorage';

interface UseTournamentResultParams {
  mode: 'standard' | 'tournament' | 'chineseOfficial';
  basePoints: string;
  winType: 'self_pick' | 'discard';
  tournamentWinnerId: string;
  tournamentDiscarderId: string;
  playerIds: string[];
  selfPick: boolean;
  jokerless: boolean;
  singlesAndPairs: boolean;
  winnerExposureCount: 0 | 1 | 2 | 3 | 4;
  isWallGame: boolean;
  timeExpired: boolean;
  deadN: boolean;
  deadE: boolean;
  deadW: boolean;
  deadS: boolean;
  selectedCustomRuleIds: Set<string>;
  customRules: CustomRule[];
}

export function useTournamentResult({
  mode,
  basePoints,
  winType,
  tournamentWinnerId,
  tournamentDiscarderId,
  playerIds,
  selfPick,
  jokerless,
  singlesAndPairs,
  winnerExposureCount,
  isWallGame,
  timeExpired,
  deadN,
  deadE,
  deadW,
  deadS,
  selectedCustomRuleIds,
  customRules,
}: UseTournamentResultParams) {
  const tournamentResult = useMemo(() => {
    if (mode !== "tournament") return null;
    const dead = [
      deadN ? "N" : null,
      deadE ? "E" : null,
      deadW ? "W" : null,
      deadS ? "S" : null,
    ].filter(Boolean) as string[];

    return computeTournament({
      basePoints: Number(basePoints || 0),
      winType: isWallGame || timeExpired ? undefined : winType,
      winnerId: isWallGame || timeExpired ? undefined : tournamentWinnerId,
      discarderId: winType === "discard" ? tournamentDiscarderId : null,
      playerIds,
      selfPick,
      jokerless,
      singlesAndPairs,
      winnerExposureCount,
      isWallGame,
      timeExpiredNoScore: timeExpired,
      deadPlayerIds: dead,
      customRules: Array.from(selectedCustomRuleIds).map(id => {
        const rule = customRules.find(r => r.id === id);
        return rule ? { id: rule.id, type: rule.type, value: rule.value } : null;
      }).filter(Boolean) as Array<{ id: string; type: 'multiplier' | 'points'; value: number }>
    });
  }, [
    mode, basePoints, winType, tournamentWinnerId, tournamentDiscarderId,
    selfPick, jokerless, singlesAndPairs, winnerExposureCount,
    isWallGame, timeExpired, deadN, deadE, deadW, deadS,
    selectedCustomRuleIds, customRules
  ]);

  return tournamentResult;
}

