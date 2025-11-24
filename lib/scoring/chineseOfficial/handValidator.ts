/**
 * Chinese Official Mahjong Hand Validation and Scoring Engine
 * 
 * Validates hands, detects sets, and maps them to fans
 */

import { Hand, Tile } from './tiles';
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
import { chineseOfficialFans } from './chineseOfficialFans';
import { calculateHandScore, playerIdToPlayer } from './scoringEngine';
import { WinType } from './chineseOfficialTypes';
import * as fanDetectors from './fanDetectors';
import { FanDetectionEngine } from './fanDetectionEngine';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  melds?: MeldKind[][];
  isSpecialHand?: boolean;
  specialHandType?: 'sevenPairs' | 'thirteenOrphans';
}

/**
 * Validate a hand - must have 14 tiles and form valid sets
 */
export function isValidHand(hand: Hand): ValidationResult {
  const nonFlowerTiles = hand.nonFlowerTiles;
  
  // Must have 14 tiles (excluding flowers)
  if (nonFlowerTiles.length !== 14) {
    return {
      isValid: false,
      error: `Hand must have exactly 14 tiles (excluding flowers). Found: ${nonFlowerTiles.length}`,
    };
  }

  // Check for special hands first
  if (detectSevenPairs(hand)) {
    return {
      isValid: true,
      isSpecialHand: true,
      specialHandType: 'sevenPairs',
    };
  }

  if (detectThirteenOrphans(hand)) {
    return {
      isValid: true,
      isSpecialHand: true,
      specialHandType: 'thirteenOrphans',
    };
  }

  // Check standard hand (4 sets + 1 pair)
  const decompositions = enumerateStandardDecompositions(hand);
  
  if (decompositions.length === 0) {
    return {
      isValid: false,
      error: 'Hand does not form valid sets. Must have 4 sets (chows/pungs/kongs) + 1 pair.',
    };
  }

  return {
    isValid: true,
    melds: decompositions,
    isSpecialHand: false,
  };
}

/**
 * Detect all applicable fans from a hand
 * Returns array of fan IDs that apply to this hand
 * 
 * Uses the structured FanDetectionEngine for organized detection
 */
export function detectFans(
  hand: Hand,
  melds: MeldKind[][],
  options: {
    isConcealed: boolean;
    isSelfDraw: boolean;
    prevalentWindPungPresent: boolean;
    seatWindPungPresent: boolean;
  }
): string[] {
  // Use the structured fan detection engine
  const engine = new FanDetectionEngine();
  return engine.detectFans(hand, melds, {
    isConcealed: options.isConcealed,
    isSelfDraw: options.isSelfDraw,
    prevalentWindPungPresent: options.prevalentWindPungPresent,
    seatWindPungPresent: options.seatWindPungPresent,
  });
  
  /* Legacy implementation - now using FanDetectionEngine above
  const detectedFanIds: string[] = [];

  // Use the first valid decomposition (or we could check all and pick best)
  // melds is an array of decompositions, each decomposition is MeldKind[]
  const dec = melds.length > 0 && melds[0].length > 0 ? melds[0] : [];

  // ========== 1-POINT FANS ==========
  
  // Pure Double Chow
  if (fanDetectors.detectPureDoubleChow(dec)) {
    detectedFanIds.push('pureDoubleChow');
  }

  // Mixed Double Chow
  if (fanDetectors.detectMixedDoubleChow(dec)) {
    detectedFanIds.push('mixedDoubleChow');
  }

  // Short Straight
  if (fanDetectors.detectShortStraight(dec)) {
    detectedFanIds.push('shortStraight');
  }

  // Two Terminal Chows
  if (fanDetectors.detectTwoTerminalChows(dec)) {
    detectedFanIds.push('twoTerminalChows');
  }

  // Pung of Terminals/Honors (not seat/prevalent)
  if (fanDetectors.detectPungTermOrHonor(dec, {
    prevalentWindPungPresent: options.prevalentWindPungPresent,
    seatWindPungPresent: options.seatWindPungPresent,
  })) {
    detectedFanIds.push('pungTermOrHonor_nonSeatPrev');
  }

  // One Voided Suit
  if (fanDetectors.hasOneVoidedSuit(hand)) {
    detectedFanIds.push('oneVoidedSuit');
  }

  // No Honor Tiles
  if (fanDetectors.hasNoHonors(hand)) {
    detectedFanIds.push('noHonorTiles');
  }

  // ========== 2-POINT FANS ==========

  // Dragon Pung
  for (const m of dec) {
    if (m.type === 'pung' || m.type === 'kong') {
      if (m.tile.kind.type === 'dragon') {
        detectedFanIds.push('dragonPung');
        break; // Only count once
      }
    }
  }

  // Prevalent Wind Pung
  if (options.prevalentWindPungPresent) {
    for (const m of dec) {
      if (m.type === 'pung' || m.type === 'kong') {
        if (m.tile.kind.type === 'wind') {
          detectedFanIds.push('prevalentWindPung');
          break;
        }
      }
    }
  }

  // Seat Wind Pung
  if (options.seatWindPungPresent) {
    for (const m of dec) {
      if (m.type === 'pung' || m.type === 'kong') {
        if (m.tile.kind.type === 'wind') {
          detectedFanIds.push('seatWindPung');
          break;
        }
      }
    }
  }

  // All Chows
  if (fanDetectors.detectAllChows(dec)) {
    detectedFanIds.push('allChows');
  }

  // Tile Hog
  if (fanDetectors.detectTileHog(hand, dec)) {
    detectedFanIds.push('tileHog');
  }

  // Double Pung
  if (fanDetectors.detectDoublePung(dec)) {
    detectedFanIds.push('doublePung');
  }

  // Two Concealed Pungs
  if (fanDetectors.detectTwoConcealedPungs(dec, options.isConcealed)) {
    detectedFanIds.push('twoConcealedPungs');
  }

  // Concealed Kong
  if (fanDetectors.detectConcealedKong(dec, options.isConcealed)) {
    detectedFanIds.push('concealedKong');
  }

  // All Simples
  if (fanDetectors.detectAllSimples(hand)) {
    detectedFanIds.push('allSimples');
  }

  // ========== 4-POINT FANS ==========

  // Outside Hand
  if (fanDetectors.detectOutsideHand(dec)) {
    detectedFanIds.push('outsideHand');
  }

  // Two Kongs
  const kongCount = dec.filter(m => m.type === 'kong').length;
  if (kongCount >= 2) {
    detectedFanIds.push('twoKongs');
  }

  // ========== 6-POINT FANS ==========

  // All Pungs
  if (isAllPungs(melds)) {
    detectedFanIds.push('allPungs');
  }

  // Half Flush
  if (isHalfFlush(hand)) {
    detectedFanIds.push('halfFlush');
  }

  // Full Flush (check after half flush to avoid duplicates)
  if (isFullFlush(hand)) {
    detectedFanIds.push('fullFlush');
  }

  // Mixed Shifted Chows (6pt)
  if (isPureShiftedChows(dec)) {
    detectedFanIds.push('mixedShiftedChows');
  }

  // All Types
  if (fanDetectors.detectAllTypes(dec)) {
    detectedFanIds.push('allTypes');
  }

  // Melded Hand
  if (fanDetectors.detectMeldedHand(options.isSelfDraw)) {
    detectedFanIds.push('meldedHand');
  }

  // Two Dragon Pungs
  if (fanDetectors.detectTwoDragonPungs(dec)) {
    detectedFanIds.push('twoDragonPungs');
  }

  // ========== 8-POINT FANS ==========

  // Mixed Straight
  if (fanDetectors.hasMixedStraight(dec)) {
    detectedFanIds.push('mixedStraight');
  }

  // Pure Straight (check after mixed to avoid duplicates)
  if (isPureStraight(dec, hand)) {
    detectedFanIds.push('pureStraight');
  }

  // Reversible Tiles
  if (isReversibleTiles(hand)) {
    detectedFanIds.push('reversibleTiles');
  }

  // Mixed Triple Chow
  if (fanDetectors.hasMixedTripleChow(dec)) {
    detectedFanIds.push('mixedTripleChow');
  }

  // Mixed Shifted Pungs
  if (fanDetectors.hasMixedShiftedPungs(dec)) {
    detectedFanIds.push('mixedShiftedPungs');
  }

  // Two Concealed Kongs
  if (kongCount >= 2 && options.isConcealed) {
    detectedFanIds.push('twoConcealedKongs');
  }

  // ========== 12-POINT FANS ==========

  // Lesser Honors & Knitted
  if (fanDetectors.detectLesserHonorsKnitted(hand)) {
    detectedFanIds.push('lesserHonorsKnitted');
  }

  // Knitted Straight
  if (fanDetectors.isKnittedStraight(hand)) {
    detectedFanIds.push('knittedStraight');
  }

  // Upper Four (6-9)
  if (fanDetectors.hasUpperFour(hand)) {
    detectedFanIds.push('upperFour');
  }

  // Lower Four (1-4)
  if (fanDetectors.hasLowerFour(hand)) {
    detectedFanIds.push('lowerFour');
  }

  // Big Three Winds
  // (Requires three wind pungs - check if we have 3 wind pungs)
  const windPungCount = dec.filter(m => 
    (m.type === 'pung' || m.type === 'kong') && m.tile.kind.type === 'wind'
  ).length;
  if (windPungCount >= 3) {
    detectedFanIds.push('bigThreeWinds');
  }

  // ========== 16-POINT FANS ==========

  // Three Suited Terminal Chows
  if (isThreeSuitedTerminalChows(dec, hand)) {
    detectedFanIds.push('threeSuitedTerminalChows');
  }

  // All Fives
  if (fanDetectors.hasAllFives(hand)) {
    detectedFanIds.push('allFives');
  }

  // Triple Pung
  if (fanDetectors.detectTriplePung(dec)) {
    detectedFanIds.push('triplePung');
  }

  // Three Concealed Pungs
  if (fanDetectors.detectThreeConcealedPungs(dec, options.isConcealed)) {
    detectedFanIds.push('threeConcealedPungs');
  }

  // ========== 24-POINT FANS ==========

  // Seven Pairs (special hand)
  if (detectSevenPairs(hand)) {
    detectedFanIds.push('sevenPairs');
  }

  // Greater Honors & Knitted
  if (fanDetectors.detectGreaterHonorsKnitted(hand)) {
    detectedFanIds.push('greaterHonorsKnitted');
  }

  // All Even Pungs
  if (isAllEvenPungs(melds)) {
    detectedFanIds.push('allEvenPungs');
  }

  // Pure Triple Chow
  if (fanDetectors.detectPureTripleChow(dec)) {
    detectedFanIds.push('pureTripleChow');
  }

  // Pure Shifted Pungs
  if (fanDetectors.detectPureShiftedPungs(dec)) {
    detectedFanIds.push('pureShiftedPungs');
  }

  // Upper Tiles (7-9)
  if (fanDetectors.hasAllUpper(hand)) {
    detectedFanIds.push('upperTiles');
  }

  // Middle Tiles (4-6)
  if (fanDetectors.hasAllMiddle(hand)) {
    detectedFanIds.push('middleTiles');
  }

  // Lower Tiles (1-3)
  if (fanDetectors.hasAllLower(hand)) {
    detectedFanIds.push('lowerTiles');
  }

  // ========== 32-POINT FANS ==========

  // Four Shifted Chows
  if (fanDetectors.hasFourShiftedChows(dec)) {
    detectedFanIds.push('fourShiftedChows');
  }

  // Three Kongs
  if (kongCount >= 3) {
    detectedFanIds.push('threeKongs');
  }

  // All Terminals & Honors
  if (fanDetectors.detectAllTerminalsHonors(hand)) {
    detectedFanIds.push('allTerminalsHonors');
  }

  // ========== 48-POINT FANS ==========

  // Quadruple Chow
  // (Four identical chows - similar to pure triple but 4)
  const chows = fanDetectors.getChows(dec);
  const chowCounts = new Map<string, number>();
  for (const chow of chows) {
    if (chow.type === 'chow') {
      const key = `${chow.suit}-${chow.base}`;
      chowCounts.set(key, (chowCounts.get(key) || 0) + 1);
    }
  }
  for (const count of chowCounts.values()) {
    if (count >= 4) {
      detectedFanIds.push('quadrupleChow');
      break;
    }
  }

  // Four Pure Shifted Pungs
  if (fanDetectors.detectFourPureShiftedPungs(dec)) {
    detectedFanIds.push('fourPureShiftedPungs');
  }

  // ========== 64-POINT FANS ==========

  // All Terminals
  if (fanDetectors.detectAllTerminals(hand)) {
    detectedFanIds.push('allTerminals');
  }

  // Little Four Winds
  if (fanDetectors.detectLittleFourWinds(dec)) {
    detectedFanIds.push('littleFourWinds');
  }

  // Little Three Dragons
  if (fanDetectors.detectLittleThreeDragons(dec)) {
    detectedFanIds.push('littleThreeDragons');
  }

  // All Honors
  if (fanDetectors.detectAllHonors(hand)) {
    detectedFanIds.push('allHonors');
  }

  // Four Concealed Pungs
  if (fanDetectors.detectFourConcealedPungs(dec, options.isConcealed)) {
    detectedFanIds.push('fourConcealedPungs');
  }

  // Pure Terminal Chows
  if (fanDetectors.detectPureTerminalChows(dec)) {
    detectedFanIds.push('pureTerminalChows');
  }

  // ========== 88-POINT FANS (LIMIT HANDS) ==========

  // Big Four Winds
  if (fanDetectors.detectBigFourWinds(dec)) {
    detectedFanIds.push('bigFourWinds');
  }

  // Big Three Dragons
  if (fanDetectors.detectBigThreeDragons(dec)) {
    detectedFanIds.push('bigThreeDragons');
  }

  // All Green
  if (fanDetectors.detectAllGreen(hand)) {
    detectedFanIds.push('allGreen');
  }

  // Nine Gates
  if (fanDetectors.isNineGates(hand, {
    isConcealed: options.isConcealed,
  })) {
    detectedFanIds.push('nineGates');
  }

  // Four Kongs
  if (kongCount >= 4) {
    detectedFanIds.push('fourKongs');
  }

  // Seven Shifted Pairs
  if (fanDetectors.isSevenShiftedPairs(hand)) {
    detectedFanIds.push('sevenShiftedPairs');
  }

  // Thirteen Orphans (special hand)
  if (detectThirteenOrphans(hand)) {
    detectedFanIds.push('thirteenOrphans');
  }

  // Melded Kong (1pt, but check here for completeness)
  if (kongCount >= 1) {
    detectedFanIds.push('meldedKong');
  }

  // Concealed hand detection
  if (options.isConcealed && options.isSelfDraw) {
    detectedFanIds.push('fullyConcealedHand_selfDraw');
  } else if (options.isConcealed && !options.isSelfDraw) {
    detectedFanIds.push('concealedHandWonByDiscard');
  }

  // Self-drawn
  if (options.isSelfDraw) {
    detectedFanIds.push('selfDrawn');
  }

  // Special hands
  if (detectSevenPairs(hand)) {
    detectedFanIds.push('sevenPairs');
  }
  if (detectThirteenOrphans(hand)) {
    detectedFanIds.push('thirteenOrphans');
  }
  
  // Remove duplicates
  return Array.from(new Set(detectedFanIds));
  */
}

/**
 * Score a hand - validates, detects fans, and calculates payment
 */
export function scoreHand(
  hand: Hand,
  options: {
    isSelfDraw: boolean;
    isConcealed: boolean;
    prevalentWindPungPresent: boolean;
    seatWindPungPresent: boolean;
    discarder?: string;
    winnerId?: string;
    otherPlayerIds?: string[];
  }
) {
  // Validate hand
  const validation = isValidHand(hand);
  
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid hand');
  }

  // Get melds (for standard hands) or use empty array for special hands
  const melds = validation.melds || [];

  // Detect fans
  const detectedFanIds = detectFans(hand, melds, {
    isConcealed: options.isConcealed,
    isSelfDraw: options.isSelfDraw,
    prevalentWindPungPresent: options.prevalentWindPungPresent,
    seatWindPungPresent: options.seatWindPungPresent,
  });

  // Convert fan IDs to Fan objects
  const detectedFans = detectedFanIds
    .map(id => chineseOfficialFans.find(f => f.id === id))
    .filter((fan): fan is typeof chineseOfficialFans[0] => fan !== undefined);

  // Calculate total points
  const fanPointsSum = detectedFans.reduce((sum, fan) => sum + fan.points, 0);
  const flowerPoints = hand.flowerCount;
  const totalPoints = fanPointsSum + flowerPoints;

  // Calculate payment using the scoring engine
  const winType: WinType = options.isSelfDraw ? 'selfDraw' : 'discardWin';
  const discarderPlayer = options.discarder ? playerIdToPlayer(options.discarder) : undefined;
  
  // Convert fans to points array for scoring engine
  const fanPointsArray = detectedFans.map(fan => fan.points);
  const handResult = calculateHandScore(
    fanPointsArray,
    winType,
    discarderPlayer,
    flowerPoints,
    detectedFans // Pass Fan objects
  );

  return {
    validation,
    detectedFans,
    fanPointsSum,
    flowerPoints,
    totalPoints,
    handResult,
  };
}

