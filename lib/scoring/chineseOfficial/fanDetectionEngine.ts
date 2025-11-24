/**
 * Chinese Official Mahjong - Structured Fan Detection Engine
 * 
 * Organized fan detection following a structured pattern similar to SwiftUI implementation
 */

import { Hand, Tile } from './tiles';
import { MeldKind } from './melds';
import { chineseOfficialFans } from './chineseOfficialFans';
import { Fan } from './chineseOfficialTypes';
import * as fanDetectors from './fanDetectors';
import * as fanHelpers from './fanHelpers';
import { ChowDetectionEngine } from './chowDetection';
import { FanTracker } from './fanTracker';
import { 
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
} from './melds';

export interface FanDetectionOptions {
  isConcealed: boolean;
  isSelfDraw: boolean;
  prevalentWindPungPresent: boolean;
  seatWindPungPresent: boolean;
  playerWind?: string;  // E, S, W, N
  prevalentWind?: string;  // E, S, W, N
  meldedSets?: MeldKind[][];  // For tracking which sets are melded
  /** Wait type: "Edge", "Closed", "Single" */
  waitType?: string;
  /** Whether this is the last tile of its kind */
  isLastTile?: boolean;
  /** Whether this is robbing a kong */
  isRobbingKong?: boolean;
  /** Whether this is out with replacement tile */
  isReplacementTile?: boolean;
  /** The winning tile (for last tile detection) */
  winningTile?: Tile;
}

export class FanDetectionEngine {
  private detectedFanIds: string[] = [];
  private fanTracker: FanTracker;

  constructor() {
    this.fanTracker = new FanTracker();
  }

  /**
   * Main entry point: Detect all applicable fans from a hand
   */
  public detectFans(
    hand: Hand,
    melds: MeldKind[][],
    options: FanDetectionOptions
  ): string[] {
    this.detectedFanIds = [];
    this.fanTracker.reset(); // Reset tracker for new hand

    // Use the first valid decomposition (or we could check all and pick best)
    const dec = melds.length > 0 && melds[0].length > 0 ? melds[0] : [];

    // 1. Special Hands (must check first - they are scored separately)
    const specialFan = this.detectSpecialHands(hand);
    if (specialFan) {
      this.detectedFanIds.push(specialFan);
      return this.detectedFanIds; // Special hands are scored separately, no further fans
    }

    // 2. Chow-based fans (complex) - detect and mark used sets
    const chowFans = this.detectChowBasedFansWithMelds(hand, dec);
    this.applyFansWithMarking(chowFans);

    // 3. Pung/Kong-based fans - detect and mark used sets
    const pungFans = this.detectPungKongFansWithMelds(hand, dec, options);
    this.applyFansWithMarking(pungFans);

    // 4. Suit-based fans - detect and mark used sets (most suit fans don't use specific melds, but some do)
    const suitFans = this.detectSuitFansWithMelds(hand, dec);
    this.applyFansWithMarking(suitFans);

    // 5. Terminals & Honors (simpler, can be checked after chows/pungs)
    this.detectedFanIds.push(...this.detectTerminalsAndHonors(hand, dec, options));

    // 6. Going-out fans (meta fans, typically don't reuse meld sets)
    this.detectedFanIds.push(...this.detectGoingOutFans(hand, dec, options));

    // Note: Flowers are NOT fans - they are point bonuses (1 point per flower)
    // Flowers are handled separately in the scoring engine and don't count toward
    // the 8-point minimum required to declare Mahjong

    // Remove duplicates
    return Array.from(new Set(this.detectedFanIds));
  }

  /**
   * Get the fan tracker (for UI integration)
   */
  public getTracker(): FanTracker {
    return this.fanTracker;
  }

  /**
   * Manually select a fan (for UI override)
   * Marks the required melds as used to prevent double-counting
   */
  public manuallySelectFan(fanId: string, requiredMelds: MeldKind[]): void {
    // Check if melds are already used
    if (this.fanTracker.areAnyUsed(requiredMelds)) {
      console.warn(`Cannot select fan ${fanId}: required melds already used`);
      return;
    }
    
    // Mark melds as used
    this.fanTracker.markUsedMultiple(requiredMelds);
    
    // Add to detected fans if not already present
    if (!this.detectedFanIds.includes(fanId)) {
      this.detectedFanIds.push(fanId);
    }
  }

  /**
   * Manually deselect a fan (for UI override)
   * Frees up the melds for other fans
   */
  public manuallyDeselectFan(fanId: string, requiredMelds: MeldKind[]): void {
    // Remove from detected fans
    const index = this.detectedFanIds.indexOf(fanId);
    if (index > -1) {
      this.detectedFanIds.splice(index, 1);
    }
    
    // Note: We don't automatically free melds because we'd need to track
    // which melds were used for which fan. This is a simplified implementation.
    // For full functionality, we'd need a fan-to-melds mapping.
  }

  /**
   * Reset tracker and detected fans (for new hand)
   */
  public reset(): void {
    this.fanTracker.reset();
    this.detectedFanIds = [];
  }

  /**
   * Get currently detected fan IDs
   */
  public getDetectedFanIds(): string[] {
    return [...this.detectedFanIds];
  }

  /**
   * 1. Detect Special Hands
   * Special hands are scored separately and exclude other fans
   */
  private detectSpecialHands(hand: Hand): string | null {
    // Seven Pairs
    if (detectSevenPairs(hand)) {
      return 'sevenPairs';
    }

    // Thirteen Orphans
    if (detectThirteenOrphans(hand)) {
      return 'thirteenOrphans';
    }

    // Nine Gates (concealed, one suit only)
    if (fanDetectors.detectNineGates(hand, true)) {
      return 'nineGates';
    }

    // Seven Shifted Pairs
    if (fanDetectors.detectSevenShiftedPairs(hand)) {
      return 'sevenShiftedPairs';
    }

    return null;
  }

  /**
   * Apply fans but only if their usedMelds are not already taken (Non-Repeat/Non-Separation)
   * This matches the Swift applyFansWithMarking pattern
   */
  private applyFansWithMarking(fans: Array<{ fanId: string; usedMelds: MeldKind[] }>): void {
    for (const { fanId, usedMelds } of fans) {
      // Check if any of the melds are already used
      if (this.fanTracker.areAnyUsed(usedMelds)) {
        continue; // Skip this fan - melds already used
      }

      // Mark each meld as used
      this.fanTracker.markUsedMultiple(usedMelds);
      
      // Add fan ID to detected fans
      if (!this.detectedFanIds.includes(fanId)) {
        this.detectedFanIds.push(fanId);
      }
    }
  }

  /**
   * Helper: Check if melds are available (not already used) and mark them as used
   */
  private checkAndMarkMelds(melds: MeldKind[]): boolean {
    if (this.fanTracker.areAnyUsed(melds)) {
      return false; // Some melds already used
    }
    this.fanTracker.markUsedMultiple(melds);
    return true;
  }

  /**
   * 2. Detect Terminals & Honors Fans
   */
  private detectTerminalsAndHonors(
    hand: Hand,
    dec: MeldKind[],
    options: FanDetectionOptions
  ): string[] {
    const fans: string[] = [];

    // Dragon Pung - check if any dragon pung/kong is available
    for (const m of dec) {
      if (m.type === 'pung' || m.type === 'kong') {
        if (m.tile.kind.type === 'dragon' && !this.fanTracker.isUsed(m)) {
          fans.push('dragonPung');
          this.fanTracker.markUsed(m);
          break; // Only count once
        }
      }
    }

    // Prevalent Wind Pung
    if (options.prevalentWindPungPresent) {
      for (const m of dec) {
        if (m.type === 'pung' || m.type === 'kong') {
          if (m.tile.kind.type === 'wind' && !this.fanTracker.isUsed(m)) {
            fans.push('prevalentWindPung');
            this.fanTracker.markUsed(m);
            break;
          }
        }
      }
    }

    // Seat Wind Pung
    if (options.seatWindPungPresent) {
      for (const m of dec) {
        if (m.type === 'pung' || m.type === 'kong') {
          if (m.tile.kind.type === 'wind' && !this.fanTracker.isUsed(m)) {
            fans.push('seatWindPung');
            this.fanTracker.markUsed(m);
            break;
          }
        }
      }
    }

    // Pung of Terminals/Honors (not seat/prevalent)
    if (fanDetectors.detectPungTermOrHonor(dec, {
      prevalentWindPungPresent: options.prevalentWindPungPresent,
      seatWindPungPresent: options.seatWindPungPresent,
    })) {
      fans.push('pungTermOrHonor_nonSeatPrev');
    }

    // Two Dragon Pungs
    if (fanDetectors.detectTwoDragonPungs(dec)) {
      fans.push('twoDragonPungs');
    }

    // Little Three Dragons
    if (fanDetectors.detectLittleThreeDragons(dec)) {
      fans.push('littleThreeDragons');
    }

    // Big Three Dragons
    if (fanDetectors.detectBigThreeDragons(dec)) {
      fans.push('bigThreeDragons');
    }

    // Little Four Winds
    if (fanDetectors.detectLittleFourWinds(dec)) {
      fans.push('littleFourWinds');
    }

    // Big Four Winds
    if (fanDetectors.detectBigFourWinds(dec)) {
      fans.push('bigFourWinds');
    }

    // All Terminals
    if (fanDetectors.detectAllTerminals(hand)) {
      fans.push('allTerminals');
    }

    // All Honors
    if (fanDetectors.detectAllHonors(hand)) {
      fans.push('allHonors');
    }

    // All Terminals & Honors
    if (fanDetectors.detectAllTerminalsHonors(hand)) {
      fans.push('allTerminalsHonors');
    }

    return fans;
  }

  /**
   * 3. Detect Chow-Based Fans with Melds
   * Returns fans with their used melds for proper Non-Separation tracking
   */
  private detectChowBasedFansWithMelds(hand: Hand, dec: MeldKind[]): Array<{ fanId: string; usedMelds: MeldKind[] }> {
    const chows = dec.filter(m => m.type === 'chow');
    const unusedChows = this.fanTracker.getUnusedMelds(chows);
    
    if (unusedChows.length === 0) return [];
    
    const results: Array<{ fanId: string; usedMelds: MeldKind[] }> = [];
    
    // Use comprehensive chow detection engine
    const chowFanIds = ChowDetectionEngine.detectAllChowFans(hand, unusedChows);
    
    // Map fan IDs to their used melds
    for (const fanId of chowFanIds) {
      const usedMelds = this.getMeldsForChowFan(fanId, unusedChows);
      if (usedMelds.length > 0) {
        results.push({ fanId, usedMelds });
      }
    }
    
    // Additional chow-based fans
    const remainingChows = this.fanTracker.getUnusedMelds(unusedChows);
    
    if (remainingChows.length > 0 && ChowDetectionEngine.detectPureStraight(hand, remainingChows)) {
      const pureStraightChows = remainingChows.filter(c => 
        c.type === 'chow' && (c.base === 1 || c.base === 4 || c.base === 7)
      );
      if (pureStraightChows.length >= 3) {
        results.push({ fanId: 'pureStraight', usedMelds: pureStraightChows.slice(0, 3) });
      }
    }
    
    if (remainingChows.length > 0 && ChowDetectionEngine.detectMixedStraight(remainingChows)) {
      const mixedStraightChows = remainingChows.filter(c => 
        c.type === 'chow' && (c.base === 1 || c.base === 4 || c.base === 7)
      );
      if (mixedStraightChows.length >= 3) {
        results.push({ fanId: 'mixedStraight', usedMelds: mixedStraightChows.slice(0, 3) });
      }
    }
    
    if (remainingChows.length > 0 && ChowDetectionEngine.detectThreeSuitedTerminalChows(hand, remainingChows)) {
      const terminalChows = remainingChows.filter(c => 
        c.type === 'chow' && (c.base === 1 || c.base === 7)
      );
      if (terminalChows.length >= 2) {
        results.push({ fanId: 'threeSuitedTerminalChows', usedMelds: terminalChows.slice(0, 2) });
      }
    }
    
    return results;
  }

  /**
   * Get the melds used for a specific chow fan
   */
  private getMeldsForChowFan(fanId: string, chows: MeldKind[]): MeldKind[] {
    // Map fan IDs to the chows they use
    const chowArray = chows.filter(m => m.type === 'chow') as Array<MeldKind & { type: 'chow' }>;
    
    switch (fanId) {
      case 'pureDoubleChow':
        // Two identical chows in same suit
        for (let i = 0; i < chowArray.length; i++) {
          for (let j = i + 1; j < chowArray.length; j++) {
            if (chowArray[i].suit === chowArray[j].suit && chowArray[i].base === chowArray[j].base) {
              return [chowArray[i], chowArray[j]];
            }
          }
        }
        break;
      case 'mixedDoubleChow':
        // Two identical chows in different suits
        for (let i = 0; i < chowArray.length; i++) {
          for (let j = i + 1; j < chowArray.length; j++) {
            if (chowArray[i].base === chowArray[j].base && chowArray[i].suit !== chowArray[j].suit) {
              return [chowArray[i], chowArray[j]];
            }
          }
        }
        break;
      case 'shortStraight':
        // Two consecutive chows in same suit
        for (let i = 0; i < chowArray.length; i++) {
          for (let j = i + 1; j < chowArray.length; j++) {
            if (chowArray[i].suit === chowArray[j].suit && Math.abs(chowArray[i].base - chowArray[j].base) === 3) {
              return [chowArray[i], chowArray[j]];
            }
          }
        }
        break;
      case 'twoTerminalChows':
        // Chows with bases 1 and 7
        const base1 = chowArray.find(c => c.base === 1);
        const base7 = chowArray.find(c => c.base === 7);
        if (base1 && base7) return [base1, base7];
        break;
      case 'allChows':
        // All four chows
        if (chowArray.length === 4) return chowArray;
        break;
      case 'pureTripleChow':
        // Three identical chows in same suit
        for (const chow of chowArray) {
          const matches = chowArray.filter(c => c.suit === chow.suit && c.base === chow.base);
          if (matches.length >= 3) return matches.slice(0, 3);
        }
        break;
      case 'mixedTripleChow':
        // Three identical chows in different suits
        for (const chow of chowArray) {
          const matches = chowArray.filter(c => c.base === chow.base);
          if (matches.length >= 3) {
            const suits = new Set(matches.map(m => m.suit));
            if (suits.size >= 3) return matches.slice(0, 3);
          }
        }
        break;
      case 'quadrupleChow':
        // Four identical chows
        for (const chow of chowArray) {
          const matches = chowArray.filter(c => c.base === chow.base);
          if (matches.length >= 4) return matches.slice(0, 4);
        }
        break;
      case 'pureShiftedChows':
        // Three consecutive chows in same suit
        const bySuit = new Map<string, typeof chowArray>();
        for (const chow of chowArray) {
          const key = chow.suit;
          if (!bySuit.has(key)) bySuit.set(key, []);
          bySuit.get(key)!.push(chow);
        }
        for (const suitChows of bySuit.values()) {
          const bases = suitChows.map(c => c.base).sort((a, b) => a - b);
          for (let i = 0; i <= bases.length - 3; i++) {
            if (bases[i + 1] === bases[i] + 1 && bases[i + 2] === bases[i + 1] + 1) {
              return suitChows.filter(c => [bases[i], bases[i + 1], bases[i + 2]].includes(c.base)).slice(0, 3);
            }
          }
        }
        break;
      case 'fourShiftedChows':
        // Four consecutive chows in same suit
        const bySuit4 = new Map<string, typeof chowArray>();
        for (const chow of chowArray) {
          const key = chow.suit;
          if (!bySuit4.has(key)) bySuit4.set(key, []);
          bySuit4.get(key)!.push(chow);
        }
        for (const suitChows of bySuit4.values()) {
          const bases = suitChows.map(c => c.base).sort((a, b) => a - b);
          for (let i = 0; i <= bases.length - 4; i++) {
            if (bases[i + 1] === bases[i] + 1 && bases[i + 2] === bases[i + 1] + 1 && bases[i + 3] === bases[i + 2] + 1) {
              return suitChows.filter(c => [bases[i], bases[i + 1], bases[i + 2], bases[i + 3]].includes(c.base)).slice(0, 4);
            }
          }
        }
        break;
      case 'pureTerminalChows':
        // All chows are terminal (base 1 or 7)
        if (chowArray.length === 4 && chowArray.every(c => c.base === 1 || c.base === 7)) {
          return chowArray;
        }
        break;
    }
    
    return [];
  }

  /**
   * 3. Detect Chow-Based Fans (legacy method for backward compatibility)
   */
  private detectChowBasedFans(hand: Hand, dec: MeldKind[]): string[] {
    const fansWithMelds = this.detectChowBasedFansWithMelds(hand, dec);
    return fansWithMelds.map(f => f.fanId);
  }

  /**
   * 4. Detect Pung/Kong-Based Fans with Melds
   * Returns fans with their used melds for proper Non-Separation tracking
   */
  private detectPungKongFansWithMelds(
    hand: Hand,
    dec: MeldKind[],
    options: FanDetectionOptions
  ): Array<{ fanId: string; usedMelds: MeldKind[] }> {
    const results: Array<{ fanId: string; usedMelds: MeldKind[] }> = [];

    // Get unused pungs and kongs
    const pungsKongs = dec.filter(m => m.type === 'pung' || m.type === 'kong');
    const unusedPungsKongs = this.fanTracker.getUnusedMelds(pungsKongs);
    const unusedKongs = unusedPungsKongs.filter(m => m.type === 'kong');
    
    const kongCount = unusedKongs.length;
    const pungCount = unusedPungsKongs.length;

    // Melded Kong - only if unused
    if (kongCount >= 1 && unusedKongs.length > 0) {
      results.push({ fanId: 'meldedKong', usedMelds: [unusedKongs[0]] });
    }

    // Two Kongs
    if (kongCount >= 2 && unusedKongs.length >= 2) {
      results.push({ fanId: 'twoKongs', usedMelds: unusedKongs.slice(0, 2) });
    }

    // Three Kongs
    if (kongCount >= 3 && unusedKongs.length >= 3) {
      results.push({ fanId: 'threeKongs', usedMelds: unusedKongs.slice(0, 3) });
    }

    // Four Kongs
    if (kongCount >= 4 && unusedKongs.length >= 4) {
      results.push({ fanId: 'fourKongs', usedMelds: unusedKongs });
    }

    // Concealed Kong - check unused kongs (after marking previous kongs)
    const remainingKongs = unusedKongs.filter(k => !results.some(r => r.usedMelds.includes(k)));
    if (remainingKongs.length > 0 && fanDetectors.detectConcealedKong(remainingKongs, options.isConcealed)) {
      results.push({ fanId: 'concealedKong', usedMelds: [remainingKongs[0]] });
    }

    // Two Concealed Kongs
    const remainingKongs2 = unusedKongs.filter(k => !results.some(r => r.usedMelds.includes(k)));
    if (remainingKongs2.length >= 2 && options.isConcealed) {
      results.push({ fanId: 'twoConcealedKongs', usedMelds: remainingKongs2.slice(0, 2) });
    }

    // Double Pung - check unused pungs
    const remainingPungs = unusedPungsKongs.filter(p => !results.some(r => r.usedMelds.includes(p)));
    if (fanDetectors.detectDoublePung(remainingPungs) && remainingPungs.length >= 2) {
      // Find the two pungs that form double pung
      const doublePungMelds = this.getMeldsForDoublePung(remainingPungs);
      if (doublePungMelds.length >= 2) {
        results.push({ fanId: 'doublePung', usedMelds: doublePungMelds.slice(0, 2) });
      }
    }

    // Triple Pung
    const remainingPungs2 = unusedPungsKongs.filter(p => !results.some(r => r.usedMelds.includes(p)));
    if (fanDetectors.detectTriplePung(remainingPungs2) && remainingPungs2.length >= 3) {
      const triplePungMelds = this.getMeldsForTriplePung(remainingPungs2);
      if (triplePungMelds.length >= 3) {
        results.push({ fanId: 'triplePung', usedMelds: triplePungMelds.slice(0, 3) });
      }
    }

    // Two Concealed Pungs - check unused pungs
    const remainingPungs3 = unusedPungsKongs.filter(p => !results.some(r => r.usedMelds.includes(p)));
    if (fanDetectors.detectTwoConcealedPungs(remainingPungs3, options.isConcealed) && remainingPungs3.length >= 2) {
      const concealedPungs = remainingPungs3.filter(p => options.isConcealed);
      if (concealedPungs.length >= 2) {
        results.push({ fanId: 'twoConcealedPungs', usedMelds: concealedPungs.slice(0, 2) });
      }
    }

    // Three Concealed Pungs
    const remainingPungs4 = unusedPungsKongs.filter(p => !results.some(r => r.usedMelds.includes(p)));
    if (fanDetectors.detectThreeConcealedPungs(remainingPungs4, options.isConcealed) && remainingPungs4.length >= 3) {
      const concealedPungs = remainingPungs4.filter(p => options.isConcealed);
      if (concealedPungs.length >= 3) {
        results.push({ fanId: 'threeConcealedPungs', usedMelds: concealedPungs.slice(0, 3) });
      }
    }

    // Four Concealed Pungs
    const remainingPungs5 = unusedPungsKongs.filter(p => !results.some(r => r.usedMelds.includes(p)));
    if (fanDetectors.detectFourConcealedPungs(remainingPungs5, options.isConcealed) && remainingPungs5.length >= 4) {
      const concealedPungs = remainingPungs5.filter(p => options.isConcealed);
      if (concealedPungs.length >= 4) {
        results.push({ fanId: 'fourConcealedPungs', usedMelds: concealedPungs });
      }
    }

    // All Pungs - only if all pungs are unused
    const remainingPungs6 = unusedPungsKongs.filter(p => !results.some(r => r.usedMelds.includes(p)));
    if (remainingPungs6.length === 4 && isAllPungs([remainingPungs6])) {
      results.push({ fanId: 'allPungs', usedMelds: remainingPungs6 });
    }

    // Mixed Shifted Pungs
    const remainingPungs7 = unusedPungsKongs.filter(p => !results.some(r => r.usedMelds.includes(p)));
    if (isMixedShiftedPungs(remainingPungs7) && remainingPungs7.length >= 3) {
      const shiftedMelds = this.getMeldsForMixedShiftedPungs(remainingPungs7);
      if (shiftedMelds.length >= 3) {
        results.push({ fanId: 'mixedShiftedPungs', usedMelds: shiftedMelds.slice(0, 3) });
      }
    }

    // Pure Shifted Pungs
    const remainingPungs8 = unusedPungsKongs.filter(p => !results.some(r => r.usedMelds.includes(p)));
    if (fanDetectors.detectPureShiftedPungs(remainingPungs8) && remainingPungs8.length >= 3) {
      const shiftedMelds = this.getMeldsForPureShiftedPungs(remainingPungs8);
      if (shiftedMelds.length >= 3) {
        results.push({ fanId: 'pureShiftedPungs', usedMelds: shiftedMelds.slice(0, 3) });
      }
    }

    // Four Pure Shifted Pungs
    const remainingPungs9 = unusedPungsKongs.filter(p => !results.some(r => r.usedMelds.includes(p)));
    if (fanDetectors.detectFourPureShiftedPungs(remainingPungs9) && remainingPungs9.length >= 4) {
      results.push({ fanId: 'fourPureShiftedPungs', usedMelds: remainingPungs9 });
    }

    // All Even Pungs
    const remainingPungs10 = unusedPungsKongs.filter(p => !results.some(r => r.usedMelds.includes(p)));
    if (isAllEvenPungs([remainingPungs10]) && remainingPungs10.length >= 4) {
      results.push({ fanId: 'allEvenPungs', usedMelds: remainingPungs10 });
    }

    return results;
  }

  /**
   * 4. Detect Pung/Kong-Based Fans (legacy method for backward compatibility)
   */
  private detectPungKongFans(
    hand: Hand,
    dec: MeldKind[],
    options: FanDetectionOptions
  ): string[] {
    const fansWithMelds = this.detectPungKongFansWithMelds(hand, dec, options);
    return fansWithMelds.map(f => f.fanId);
  }

  /**
   * Helper: Get melds for Double Pung
   */
  private getMeldsForDoublePung(pungs: MeldKind[]): MeldKind[] {
    // Find two pungs with same rank in different suits
    for (let i = 0; i < pungs.length; i++) {
      for (let j = i + 1; j < pungs.length; j++) {
        const p1 = pungs[i];
        const p2 = pungs[j];
        if ((p1.type === 'pung' || p1.type === 'kong') && (p2.type === 'pung' || p2.type === 'kong')) {
          if (p1.tile.description === p2.tile.description) {
            return [p1, p2];
          }
        }
      }
    }
    return [];
  }

  /**
   * Helper: Get melds for Triple Pung
   */
  private getMeldsForTriplePung(pungs: MeldKind[]): MeldKind[] {
    // Find three pungs with same rank
    const byTile = new Map<string, MeldKind[]>();
    for (const pung of pungs) {
      if (pung.type === 'pung' || pung.type === 'kong') {
        const key = pung.tile.description;
        if (!byTile.has(key)) byTile.set(key, []);
        byTile.get(key)!.push(pung);
      }
    }
    for (const melds of byTile.values()) {
      if (melds.length >= 3) {
        return melds.slice(0, 3);
      }
    }
    return [];
  }

  /**
   * Helper: Get melds for Mixed Shifted Pungs
   */
  private getMeldsForMixedShiftedPungs(pungs: MeldKind[]): MeldKind[] {
    // Three pungs with consecutive ranks in different suits
    const suitedPungs = pungs.filter(p => 
      (p.type === 'pung' || p.type === 'kong') && p.tile.kind.type === 'suited'
    ) as Array<MeldKind & { type: 'pung' | 'kong'; tile: Tile }>;
    
    const byRank = new Map<number, MeldKind[]>();
    for (const pung of suitedPungs) {
      if (pung.tile.kind.type === 'suited') {
        const rank = pung.tile.kind.rank;
        if (!byRank.has(rank)) byRank.set(rank, []);
        byRank.get(rank)!.push(pung);
      }
    }
    
    const ranks = Array.from(byRank.keys()).sort((a, b) => a - b);
    for (let i = 0; i <= ranks.length - 3; i++) {
      if (ranks[i + 1] === ranks[i] + 1 && ranks[i + 2] === ranks[i + 1] + 1) {
        const melds: MeldKind[] = [];
        for (let j = 0; j < 3; j++) {
          const rankMelds = byRank.get(ranks[i + j]) || [];
          if (rankMelds.length > 0) melds.push(rankMelds[0]);
        }
        if (melds.length === 3) {
          // Check they're in different suits
          const suits = new Set(melds.map(m => {
            if ((m.type === 'pung' || m.type === 'kong') && m.tile.kind.type === 'suited') {
              return m.tile.kind.suit;
            }
            return null;
          }).filter(Boolean));
          if (suits.size >= 3) return melds;
        }
      }
    }
    return [];
  }

  /**
   * Helper: Get melds for Pure Shifted Pungs
   */
  private getMeldsForPureShiftedPungs(pungs: MeldKind[]): MeldKind[] {
    // Three pungs with consecutive ranks in same suit
    const suitedPungs = pungs.filter(p => {
      if ((p.type === 'pung' || p.type === 'kong') && p.tile.kind.type === 'suited') {
        return true;
      }
      return false;
    }) as Array<MeldKind & { type: 'pung' | 'kong'; tile: Tile }>;
    
    const bySuit = new Map<string, MeldKind[]>();
    for (const pung of suitedPungs) {
      if (pung.tile.kind.type === 'suited') {
        const suit = pung.tile.kind.suit;
        if (!bySuit.has(suit)) bySuit.set(suit, []);
        bySuit.get(suit)!.push(pung);
      }
    }
    
    for (const suitPungs of bySuit.values()) {
      const ranks = suitPungs.map(p => {
        if ((p.type === 'pung' || p.type === 'kong') && p.tile.kind.type === 'suited') {
          return p.tile.kind.rank;
        }
        return 0;
      }).filter(r => r > 0).sort((a, b) => a - b);
      
      for (let i = 0; i <= ranks.length - 3; i++) {
        if (ranks[i + 1] === ranks[i] + 1 && ranks[i + 2] === ranks[i + 1] + 1) {
          const melds: MeldKind[] = [];
          for (let j = 0; j < 3; j++) {
            const rank = ranks[i + j];
            const rankMeld = suitPungs.find(p => {
              if ((p.type === 'pung' || p.type === 'kong') && p.tile.kind.type === 'suited') {
                return p.tile.kind.rank === rank;
              }
              return false;
            });
            if (rankMeld) melds.push(rankMeld);
          }
          if (melds.length === 3) return melds;
        }
      }
    }
    return [];
  }

  /**
   * 5. Detect Suit-Based Fans with Melds
   * Most suit-based fans don't use specific melds (they're hand-level patterns)
   * But we return them in the same format for consistency
   */
  private detectSuitFansWithMelds(hand: Hand, dec: MeldKind[]): Array<{ fanId: string; usedMelds: MeldKind[] }> {
    const results: Array<{ fanId: string; usedMelds: MeldKind[] }> = [];

    // Full Flush (one suit only) - uses all melds
    if (isFullFlush(hand)) {
      results.push({ fanId: 'fullFlush', usedMelds: dec });
    }

    // Half Flush (one suit + honors) - uses all melds
    if (isHalfFlush(hand)) {
      results.push({ fanId: 'halfFlush', usedMelds: dec });
    }

    // One Voided Suit - no specific melds
    if (fanDetectors.hasOneVoidedSuit(hand)) {
      results.push({ fanId: 'oneVoidedSuit', usedMelds: [] });
    }

    // No Honor Tiles - no specific melds
    if (fanDetectors.hasNoHonors(hand)) {
      results.push({ fanId: 'noHonorTiles', usedMelds: [] });
    }

    // All Simples - no specific melds
    if (fanDetectors.detectAllSimples(hand)) {
      results.push({ fanId: 'allSimples', usedMelds: [] });
    }

    // All Fives - uses all melds
    if (isAllFives(hand)) {
      results.push({ fanId: 'allFives', usedMelds: dec });
    }

    // All Upper (7-9) - uses all melds
    if (isAllUpper(hand)) {
      results.push({ fanId: 'upperTiles', usedMelds: dec });
    }

    // All Middle (4-6) - uses all melds
    if (isAllMiddle(hand)) {
      results.push({ fanId: 'middleTiles', usedMelds: dec });
    }

    // All Lower (1-3) - uses all melds
    if (isAllLower(hand)) {
      results.push({ fanId: 'lowerTiles', usedMelds: dec });
    }

    // Upper Four (6-9) - uses all melds
    if (fanHelpers.hasUpperFour(hand)) {
      results.push({ fanId: 'upperFour', usedMelds: dec });
    }

    // Lower Four (1-4) - uses all melds
    if (fanHelpers.hasLowerFour(hand)) {
      results.push({ fanId: 'lowerFour', usedMelds: dec });
    }

    // All Green - uses all melds
    if (fanDetectors.detectAllGreen(hand)) {
      results.push({ fanId: 'allGreen', usedMelds: dec });
    }

    // All Reversible - uses all melds
    if (isReversibleTiles(hand)) {
      results.push({ fanId: 'reversibleTiles', usedMelds: dec });
    }

    // All Types - uses all melds
    if (fanDetectors.detectAllTypes(dec)) {
      results.push({ fanId: 'allTypes', usedMelds: dec });
    }

    return results;
  }

  /**
   * 5. Detect Suit-Based Fans (legacy method for backward compatibility)
   */
  private detectSuitFans(hand: Hand, dec: MeldKind[]): string[] {
    const fansWithMelds = this.detectSuitFansWithMelds(hand, dec);
    return fansWithMelds.map(f => f.fanId);
  }

  /**
   * 5. Detect Suit-Based Fans (old implementation - keeping for reference)
   */
  private detectSuitFansOld(hand: Hand, dec: MeldKind[]): string[] {
    const fans: string[] = [];

    // Full Flush (one suit only)
    if (isFullFlush(hand)) {
      fans.push('fullFlush');
    }

    // Half Flush (one suit + honors)
    if (isHalfFlush(hand)) {
      fans.push('halfFlush');
    }

    // One Voided Suit
    if (fanDetectors.hasOneVoidedSuit(hand)) {
      fans.push('oneVoidedSuit');
    }

    // No Honor Tiles
    if (fanDetectors.hasNoHonors(hand)) {
      fans.push('noHonorTiles');
    }

    // All Simples
    if (fanDetectors.detectAllSimples(hand)) {
      fans.push('allSimples');
    }

    // All Fives
    if (isAllFives(hand)) {
      fans.push('allFives');
    }

    // All Upper (7-9)
    if (isAllUpper(hand)) {
      fans.push('upperTiles');
    }

    // All Middle (4-6)
    if (isAllMiddle(hand)) {
      fans.push('middleTiles');
    }

    // All Lower (1-3)
    if (isAllLower(hand)) {
      fans.push('lowerTiles');
    }

    // Upper Four (6-9)
    if (fanHelpers.hasUpperFour(hand)) {
      fans.push('upperFour');
    }

    // Lower Four (1-4)
    if (fanHelpers.hasLowerFour(hand)) {
      fans.push('lowerFour');
    }

    // All Green
    if (fanDetectors.detectAllGreen(hand)) {
      fans.push('allGreen');
    }

    // All Reversible
    if (isReversibleTiles(hand)) {
      fans.push('reversibleTiles');
    }

    // All Types
    if (fanDetectors.detectAllTypes(dec)) {
      fans.push('allTypes');
    }

    return fans;
  }

  /**
   * 6. Detect Going-Out Fans
   */
  private detectGoingOutFans(
    hand: Hand,
    dec: MeldKind[],
    options: FanDetectionOptions
  ): string[] {
    const fans: string[] = [];

    // Self-Drawn
    if (options.isSelfDraw) {
      fans.push('selfDrawn');
    }

    // Fully Concealed Hand (self-draw)
    if (options.isConcealed && options.isSelfDraw) {
      fans.push('fullyConcealedHand_selfDraw');
    }

    // Concealed Hand (won by discard)
    if (options.isConcealed && !options.isSelfDraw) {
      fans.push('concealedHandWonByDiscard');
    }

    // Melded Hand
    if (fanDetectors.detectMeldedHand(options.isSelfDraw)) {
      fans.push('meldedHand');
    }

    // Edge Wait
    if (fanDetectors.detectEdgeWait(dec)) {
      fans.push('edgeWait');
    }

    // Closed Wait
    if (fanDetectors.detectClosedWait(dec)) {
      fans.push('closedWait');
    }

    // Single Wait
    if (fanDetectors.detectSingleWait(dec)) {
      fans.push('singleWait');
    }

    // Last Tile (tile is last of its kind)
    if (fanDetectors.detectLastTile()) {
      fans.push('lastTile');
    }

    // Last Tile Draw (self-draw last tile)
    if (fanDetectors.detectLastTileDraw(options.isSelfDraw)) {
      fans.push('lastTileDraw');
    }

    // Last Tile Claim
    if (fanDetectors.detectLastTileClaim(options.isSelfDraw)) {
      fans.push('lastTileClaim');
    }

    // Out with Replacement Tile
    if (fanDetectors.detectOutWithReplacementTile()) {
      fans.push('outWithReplacementTile');
    }

    // Robbing the Kong (check if there's a kong in the hand)
    const hasKong = dec.some(m => m.type === 'kong');
    if (hasKong) {
      // This is a simplified check - actual robbing kong requires game state
      fans.push('robbingTheKong');
    }

    // Tile Hog
    if (fanDetectors.detectTileHog(hand, dec)) {
      fans.push('tileHog');
    }

    // Knitted Straight
    if (isKnittedStraight(hand)) {
      fans.push('knittedStraight');
    }

    // Lesser Honors & Knitted
    if (fanDetectors.detectLesserHonorsKnitted(hand)) {
      fans.push('lesserHonorsKnitted');
    }

    // Greater Honors & Knitted
    if (fanDetectors.detectGreaterHonorsKnitted(hand)) {
      fans.push('greaterHonorsKnitted');
    }

    // Big Three Winds
    const windPungCount = dec.filter(m => 
      (m.type === 'pung' || m.type === 'kong') && m.tile.kind.type === 'wind'
    ).length;
    if (windPungCount >= 3) {
      fans.push('bigThreeWinds');
    }

    // Pure Straight
    if (isPureStraight(dec, hand)) {
      fans.push('pureStraight');
    }

    // Mixed Straight
    if (isMixedStraight(dec)) {
      fans.push('mixedStraight');
    }

    return fans;
  }

  /**
   * Get detected fans as Fan objects
   */
  public getDetectedFans(fanIds: string[]): Fan[] {
    return fanIds
      .map(id => chineseOfficialFans.find(f => f.id === id))
      .filter((fan): fan is Fan => fan !== undefined);
  }
}

