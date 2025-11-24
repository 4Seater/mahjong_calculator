import { useCallback } from 'react';
import type { TileInputEngine } from '@/lib/scoring/chineseOfficial/tileInputEngine';

interface UseClearHandlersParams {
  // Common state setters
  setBasePoints: (value: string) => void;
  setWinType: (value: 'self_pick' | 'discard') => void;
  setJokerless: (value: boolean) => void;
  setDisplayMode: (value: 'currency' | 'points') => void;
  
  // Standard mode setters
  setSinglesAndPairs?: (value: boolean) => void;
  setMisnamedJoker?: (value: boolean) => void;
  setHeavenlyHand?: (value: boolean) => void;
  setWallGame?: (value: boolean) => void;
  setKittyEnabled?: (value: boolean) => void;
  setKittyPayout?: (value: string) => void;
  setNoExposures?: (value: boolean) => void;
  setExposurePenaltyEnabled?: (value: boolean) => void;
  setExposurePenaltyPerExposure?: (value: string) => void;
  setStandardWinnerExposureCount?: (value: string) => void;
  setLastTileFromWall?: (value: boolean) => void;
  setLastTileClaim?: (value: boolean) => void;
  setRobbingTheJoker?: (value: boolean) => void;
  setEastDouble?: (value: boolean) => void;
  setIsWinnerEast?: (value: boolean) => void;
  
  // Hand selection setters
  setSelectedCategoryId?: (value: string) => void;
  setSelectedHand?: (value: string) => void;
  setHandName?: (value: string) => void;
  
  // Custom rules setters
  setSelectedCustomRuleIds?: (value: Set<string>) => void;
  setCustomRuleValues?: (value: Record<string, { type: 'multiplier' | 'points', value: number }>) => void;
  
  // Tournament mode setters
  setTournamentWinnerId?: (value: string) => void;
  setTournamentDiscarderId?: (value: string) => void;
  setSelfPick?: (value: boolean) => void;
  setWinnerExposureCount?: (value: 0 | 1 | 2 | 3 | 4) => void;
  setIsWallGame?: (value: boolean) => void;
  setTimeExpired?: (value: boolean) => void;
  setDeadN?: (value: boolean) => void;
  setDeadE?: (value: boolean) => void;
  setDeadW?: (value: boolean) => void;
  setDeadS?: (value: boolean) => void;
  
  // Chinese Official mode setters
  setChineseOfficialSelectedFans?: (value: Set<string>) => void;
  setChineseOfficialFlowerCount?: (value: string) => void;
  setChineseOfficialIsSelfDraw?: (value: boolean) => void;
  setChineseOfficialIsConcealed?: (value: boolean) => void;
  setChineseOfficialPrevalentWindPung?: (value: boolean) => void;
  setChineseOfficialSeatWindPung?: (value: boolean) => void;
  setChineseOfficialHand?: (value: any) => void;
  setDetectedFanIds?: (value: string[]) => void;
  setChineseOfficialInputMode?: (value: 'fanSelection' | 'tileInput') => void;
  setManualTiles?: (value: any[]) => void;
  setTileInputError?: (value: string | null) => void;
  tileInputEngine?: TileInputEngine;
}

export function useClearHandlers(params: UseClearHandlersParams) {
  const {
    setBasePoints,
    setWinType,
    setJokerless,
    setDisplayMode,
    setSinglesAndPairs,
    setMisnamedJoker,
    setHeavenlyHand,
    setWallGame,
    setKittyEnabled,
    setKittyPayout,
    setNoExposures,
    setExposurePenaltyEnabled,
    setExposurePenaltyPerExposure,
    setStandardWinnerExposureCount,
    setLastTileFromWall,
    setLastTileClaim,
    setRobbingTheJoker,
    setEastDouble,
    setIsWinnerEast,
    setSelectedCategoryId,
    setSelectedHand,
    setHandName,
    setSelectedCustomRuleIds,
    setCustomRuleValues,
    setTournamentWinnerId,
    setTournamentDiscarderId,
    setSelfPick,
    setWinnerExposureCount,
    setIsWallGame,
    setTimeExpired,
    setDeadN,
    setDeadE,
    setDeadW,
    setDeadS,
    setChineseOfficialSelectedFans,
    setChineseOfficialFlowerCount,
    setChineseOfficialIsSelfDraw,
    setChineseOfficialIsConcealed,
    setChineseOfficialPrevalentWindPung,
    setChineseOfficialSeatWindPung,
    setChineseOfficialHand,
    setDetectedFanIds,
    setChineseOfficialInputMode,
    setManualTiles,
    setTileInputError,
    tileInputEngine,
  } = params;

  const clearStandard = useCallback(() => {
    setBasePoints("");
    setWinType("self_pick");
    setJokerless(false);
    setSinglesAndPairs?.(false);
    setMisnamedJoker?.(false);
    setHeavenlyHand?.(false);
    setWallGame?.(false);
    setKittyEnabled?.(false);
    setKittyPayout?.("10");
    setNoExposures?.(false);
    setExposurePenaltyEnabled?.(false);
    setExposurePenaltyPerExposure?.("5");
    setStandardWinnerExposureCount?.("0");
    setLastTileFromWall?.(false);
    setLastTileClaim?.(false);
    setRobbingTheJoker?.(false);
    setEastDouble?.(false);
    setIsWinnerEast?.(false);
    setSelectedCategoryId?.("");
    setSelectedHand?.("");
    setHandName?.("");
    setSelectedCustomRuleIds?.(new Set());
    setCustomRuleValues?.({});
    setDisplayMode("currency"); // Reset display format to money
  }, [
    setBasePoints,
    setWinType,
    setJokerless,
    setDisplayMode,
    setSinglesAndPairs,
    setMisnamedJoker,
    setHeavenlyHand,
    setWallGame,
    setKittyEnabled,
    setKittyPayout,
    setNoExposures,
    setExposurePenaltyEnabled,
    setExposurePenaltyPerExposure,
    setStandardWinnerExposureCount,
    setLastTileFromWall,
    setLastTileClaim,
    setRobbingTheJoker,
    setEastDouble,
    setIsWinnerEast,
    setSelectedCategoryId,
    setSelectedHand,
    setHandName,
    setSelectedCustomRuleIds,
    setCustomRuleValues,
  ]);

  const clearTournament = useCallback(() => {
    setBasePoints("");
    setTournamentWinnerId?.("N");
    setTournamentDiscarderId?.("W");
    setSelfPick?.(true);
    setWinnerExposureCount?.(0);
    setIsWallGame?.(false);
    setTimeExpired?.(false);
    setDeadN?.(false);
    setDeadE?.(false);
    setDeadW?.(false);
    setDeadS?.(false);
    setWinType("self_pick");
    setJokerless(false);
    setNoExposures?.(false);
    setExposurePenaltyEnabled?.(false);
    setExposurePenaltyPerExposure?.("5");
    setLastTileFromWall?.(false);
    setLastTileClaim?.(false);
    setRobbingTheJoker?.(false);
    setSelectedCustomRuleIds?.(new Set());
    setCustomRuleValues?.({});
  }, [
    setBasePoints,
    setWinType,
    setJokerless,
    setTournamentWinnerId,
    setTournamentDiscarderId,
    setSelfPick,
    setWinnerExposureCount,
    setIsWallGame,
    setTimeExpired,
    setDeadN,
    setDeadE,
    setDeadW,
    setDeadS,
    setNoExposures,
    setExposurePenaltyEnabled,
    setExposurePenaltyPerExposure,
    setLastTileFromWall,
    setLastTileClaim,
    setRobbingTheJoker,
    setSelectedCustomRuleIds,
    setCustomRuleValues,
  ]);

  const clearChineseOfficial = useCallback(() => {
    setChineseOfficialSelectedFans?.(new Set());
    setChineseOfficialFlowerCount?.("0");
    setChineseOfficialIsSelfDraw?.(false);
    setChineseOfficialIsConcealed?.(false);
    setChineseOfficialPrevalentWindPung?.(false);
    setChineseOfficialSeatWindPung?.(false);
    setChineseOfficialHand?.(null);
    setDetectedFanIds?.([]);
    setChineseOfficialInputMode?.('fanSelection');
    if (tileInputEngine) {
      tileInputEngine.resetHand();
      const state = tileInputEngine.getState();
      setManualTiles?.(state.tiles);
    }
    setTileInputError?.(null);
  }, [
    setChineseOfficialSelectedFans,
    setChineseOfficialFlowerCount,
    setChineseOfficialIsSelfDraw,
    setChineseOfficialIsConcealed,
    setChineseOfficialPrevalentWindPung,
    setChineseOfficialSeatWindPung,
    setChineseOfficialHand,
    setDetectedFanIds,
    setChineseOfficialInputMode,
    setManualTiles,
    setTileInputError,
    tileInputEngine,
  ]);

  return {
    clearStandard,
    clearTournament,
    clearChineseOfficial,
  };
}

