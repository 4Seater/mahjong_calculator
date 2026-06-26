import { useMemo } from 'react';
import { computeTournament } from '@/lib/scoring/engine';
import type { TournamentGameResult } from '@/lib/scoring/types';

interface UseTournamentResultParams {
  mode: 'standard' | 'international' | 'tournament' | 'chineseOfficial';
  basePoints: string;
  winType: 'self_pick' | 'discard';
  tournamentWinnerId: string;
  tournamentDiscarderId: string;
  playerIds: string[];
  jokerless: boolean;
  singlesAndPairs: boolean;
  winnerExposureCount: 0 | 1 | 2 | 3 | 4;
  isWallGame: boolean;
  tournamentGameResult: TournamentGameResult;
  falseMahjongIntactPlayerId: string;
  deadN: boolean;
  deadE: boolean;
  deadW: boolean;
  deadS: boolean;
}

export function useTournamentResult({
  mode,
  basePoints,
  winType,
  tournamentWinnerId,
  tournamentDiscarderId,
  playerIds,
  jokerless,
  singlesAndPairs,
  winnerExposureCount,
  isWallGame,
  tournamentGameResult,
  falseMahjongIntactPlayerId,
  deadN,
  deadE,
  deadW,
  deadS,
}: UseTournamentResultParams) {
  const tournamentResult = useMemo(() => {
    if (mode !== 'tournament') return null;

    const dead = [
      deadN ? 'N' : null,
      deadE ? 'E' : null,
      deadW ? 'W' : null,
      deadS ? 'S' : null,
    ].filter(Boolean) as string[];

    const isSpecialOutcome =
      isWallGame ||
      tournamentGameResult !== 'valid_win';

    return computeTournament({
      basePoints: Number(basePoints || 0),
      winType: isSpecialOutcome ? undefined : winType,
      winnerId: isSpecialOutcome ? undefined : tournamentWinnerId,
      discarderId: winType === 'discard' && !isSpecialOutcome ? tournamentDiscarderId : null,
      playerIds,
      selfPick: winType === 'self_pick',
      jokerless,
      singlesAndPairs,
      winnerExposureCount,
      isWallGame,
      timeExpiredNoScore: tournamentGameResult === 'time_expired',
      deadPlayerIds: dead,
      falseMahjongAllExposed: tournamentGameResult === 'false_mj_all_exposed',
      falseMahjongOneIntactId:
        tournamentGameResult === 'false_mj_one_intact'
          ? falseMahjongIntactPlayerId
          : null,
      falseMahjongGameContinues: tournamentGameResult === 'false_mj_game_continues',
    });
  }, [
    mode,
    basePoints,
    winType,
    tournamentWinnerId,
    tournamentDiscarderId,
    playerIds,
    jokerless,
    singlesAndPairs,
    winnerExposureCount,
    isWallGame,
    tournamentGameResult,
    falseMahjongIntactPlayerId,
    deadN,
    deadE,
    deadW,
    deadS,
  ]);

  return tournamentResult;
}
