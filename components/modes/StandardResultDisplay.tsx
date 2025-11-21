import React from 'react';
import { View, Text } from 'react-native';
import { getColors } from '@/constants/colors';
import { styles } from '../ScoreCalculatorCard.styles';
import type { ScoreResult } from '@/lib/scoring/types';
import type { CustomRule } from '@/lib/storage/customRulesStorage';
import StandardSaveHand from './StandardSaveHand';
import StandardClearButton from './American/StandardClearButton';

interface StandardResultDisplayProps {
  result: ScoreResult;
  winType: 'self_pick' | 'discard';
  displayMode: 'currency' | 'points';
  theme: 'light' | 'dark';
  eastDouble: boolean;
  isWinnerEast: boolean;
  winnerId?: string;
  selectedCustomRuleIds: Set<string>;
  customRules: CustomRule[];
  // Save Hand props
  handName: string;
  basePoints: string;
  jokerless: boolean;
  singlesAndPairs: boolean;
  noExposures: boolean;
  standardWinnerExposureCount: string;
  saveSuccess: boolean;
  onSaveSuccess: (success: boolean) => void;
  // Clear button props
  onClear: () => void;
}

export default function StandardResultDisplay({
  result,
  winType,
  displayMode,
  theme,
  eastDouble,
  isWinnerEast,
  winnerId,
  selectedCustomRuleIds,
  customRules,
  handName,
  basePoints,
  jokerless,
  singlesAndPairs,
  noExposures,
  standardWinnerExposureCount,
  saveSuccess,
  onSaveSuccess,
  onClear,
}: StandardResultDisplayProps) {
  const colors = getColors(theme);

  return (
    <>
      <Text style={styles.resultsTitle(colors)}>Standard Breakdown</Text>

      {/* Base NMJL multipliers in play */}
      {winType === "self_pick" ? (
        <Text style={styles.resultText(colors)}>Pattern: Self-Pick → everyone pays ×{(result.rule.allMultiplier ?? 0).toString()}</Text>
      ) : (
        <Text style={styles.resultText(colors)}>
          Pattern: Discard → discarder ×{result.rule.discarderMultiplier ?? 0}, others ×{result.rule.otherMultiplier ?? 0}
        </Text>
      )}
      <Text style={styles.resultText(colors)}>Jokerless applied: {result.rule.jokerlessApplied ? "Yes" : "No"}</Text>
      {result.rule.misnamedJokerApplied && (
        <Text style={styles.resultText(colors)}>Misnamed Joker: Yes (discarder pays 4×, others pay nothing)</Text>
      )}
      {(result.rule.doublesApplied ?? 0) > 0 && (
        <Text style={styles.resultText(colors)}>
          Doubles applied: {result.rule.doublesApplied} (×{Math.pow(2, result.rule.doublesApplied ?? 0)} multiplier)
        </Text>
      )}
      {result.rule.eastDoubleApplied && (
        <Text style={styles.resultText(colors)}>East's Double: Applied (East pays/receives double)</Text>
      )}
      {selectedCustomRuleIds.size > 0 && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.resultText(colors)}>Custom Rules Applied:</Text>
          {Array.from(selectedCustomRuleIds).map(id => {
            const rule = customRules.find(r => r.id === id);
            if (!rule) return null;
            
            // Build description for new format
            const parts: string[] = [];
            
            // Winner bonus
            if (rule.winnerBonus) {
              if (rule.winnerBonus.type === 'multiplier') {
                parts.push(`Winner: ×${rule.winnerBonus.value}`);
              } else {
                parts.push(`Winner: +${rule.winnerBonus.value} ${displayMode === 'currency' ? 'cents' : 'points'}`);
              }
            }
            
            // Discarder penalty
            if (rule.discarderPenalty?.enabled) {
              if (rule.discarderPenalty.type === 'multiplier') {
                parts.push(`Discarder: ×${rule.discarderPenalty.value}`);
              } else {
                parts.push(`Discarder: -${rule.discarderPenalty.value} ${displayMode === 'currency' ? 'cents' : 'points'}`);
              }
            }
            
            // All player penalty
            if (rule.allPlayerPenalty?.enabled) {
              if (rule.allPlayerPenalty.type === 'multiplier') {
                parts.push(`Each opponent: ×${rule.allPlayerPenalty.value}`);
              } else {
                parts.push(`Each opponent: -${rule.allPlayerPenalty.value} ${displayMode === 'currency' ? 'cents' : 'points'}`);
              }
            }
            
            // Legacy format support
            if (parts.length === 0) {
              if (rule.type === 'multiplier' && rule.value) {
                parts.push(`×${rule.value}`);
              } else if (rule.type === 'points' && rule.value) {
                parts.push(`+${rule.value} ${displayMode === 'currency' ? 'cents' : 'points'}`);
              } else if (rule.type === 'opponentDeduction' && rule.value) {
                parts.push(`Each opponent: -${rule.value} ${displayMode === 'currency' ? 'cents' : 'points'}`);
              } else if (rule.type === 'discarderDeduction' && rule.value) {
                parts.push(`Discarder: -${rule.value} ${displayMode === 'currency' ? 'cents' : 'points'}`);
              }
            }
            
            // Skip if no effects found
            if (parts.length === 0) {
              return null;
            }
            
            return (
              <Text key={id} style={[styles.resultText(colors), { marginLeft: 8, marginTop: 2 }]}>
                • {rule.title || 'Custom Rule'}: {parts.join(', ')}
              </Text>
            );
          })}
        </View>
      )}

      {/* No-Exposures description */}
      {result.appliedNoExposureBonus && result.appliedNoExposureBonus.applied && (
        <Text style={[styles.resultText(colors), { marginTop: 4 }]}>
          No-Exposures bonus: {result.appliedNoExposureBonus.mode === "flat" ? "+" : "×"}{result.appliedNoExposureBonus.value}
        </Text>
      )}

      {/* Per-payer */}
      <View style={styles.paymentSection}>
        {/* Show individual payer breakdown when East's double is enabled and winner is not East */}
        {eastDouble && !isWinnerEast && Object.keys(result.payerMap || {}).length > 0 ? (
          <>
            {(() => {
              // Get all payer entries (excluding winner)
              const allPayerEntries = Object.entries(result.payerMap || {})
                .filter(([pid, amt]) => pid !== winnerId && amt > 0);
              
              // Find East entry - check for "E" or "East" in the payerMap keys
              const eastEntry = allPayerEntries.find(([pid]) => 
                pid === "E" || pid === "East"
              );
              
              // Get other players (non-East)
              const otherEntries = allPayerEntries.filter(([pid]) => 
                pid !== "E" && pid !== "East"
              );
              
              // Get the standard amount (from first other player, or calculate from East if needed)
              const standardAmount = otherEntries.length > 0 
                ? otherEntries[0][1] 
                : (eastEntry ? eastEntry[1] / 2 : 0);
              
              return (
                <>
                  {/* East pays section - always show if East is in payerMap */}
                  {eastEntry && (
                    <Text style={styles.paymentText(colors)}>
                      {displayMode === "currency"
                        ? `East pays: $${(eastEntry[1] / 100).toFixed(2)} (2× standard)`
                        : `East: -${eastEntry[1]} pts (2× standard)`}
                    </Text>
                  )}
                  
                  {/* Opponents pay section */}
                  {otherEntries.length > 0 && (
                    <Text style={styles.paymentText(colors)}>
                      {displayMode === "currency"
                        ? `Each opponent pays: $${(standardAmount / 100).toFixed(2)}`
                        : `Each opponent: -${standardAmount} pts`}
                    </Text>
                  )}
                </>
              );
            })()}
          </>
        ) : (
          <>
            {winType === "discard" ? (
              <>
                <Text style={styles.paymentText(colors)}>
                  {displayMode === "currency" 
                    ? `Discarder pays: $${((result.perLoserAmounts.discarder ?? 0) / 100).toFixed(2)}`
                    : `Discarder: -${result.perLoserAmounts.discarder ?? 0} pts`}
                </Text>
                <Text style={styles.paymentText(colors)}>
                  {displayMode === "currency"
                    ? `Each other player pays: $${((result.perLoserAmounts.others ?? 0) / 100).toFixed(2)}`
                    : `Each opponent: -${result.perLoserAmounts.others ?? 0} pts`}
                </Text>
              </>
            ) : (
              <Text style={styles.paymentText(colors)}>
                {displayMode === "currency"
                  ? `Each opponent pays: $${((result.perLoserAmounts.others ?? 0) / 100).toFixed(2)}`
                  : `Each opponent: -${result.perLoserAmounts.others ?? 0} pts`}
              </Text>
            )}
          </>
        )}
        {(result.jokerlessPointsBonus ?? 0) > 0 && (
          <Text style={styles.resultText(colors)}>
            Jokerless bonus: +{result.jokerlessPointsBonus} {displayMode === "currency" ? "cents" : "pts"}
          </Text>
        )}
        {(result.exposurePenalty ?? 0) > 0 && (
          <Text style={styles.resultText(colors)}>
            Exposure penalty: -{result.exposurePenalty} {displayMode === "currency" ? "cents" : "pts"}
          </Text>
        )}
        <Text style={styles.totalText(colors, theme)}>
          Total to Winner: {displayMode === "currency"
            ? `$${(result.totalToWinner / 100).toFixed(2)}`
            : `${result.totalToWinner} pts`}
        </Text>
      </View>

      {/* Save Hand Section */}
      <StandardSaveHand
        handName={handName}
        basePoints={basePoints}
        winType={winType}
        jokerless={jokerless}
        singlesAndPairs={singlesAndPairs}
        noExposures={noExposures}
        result={result}
        displayMode={displayMode}
        mode="standard"
        standardWinnerExposureCount={standardWinnerExposureCount}
        saveSuccess={saveSuccess}
        theme={theme}
        onSaveSuccess={onSaveSuccess}
      />
      
      {/* Clear Button */}
      <StandardClearButton
        theme={theme}
        onClear={onClear}
      />

      {/* Optional: show payer map if IDs were passed and not already shown in main breakdown */}
      {Object.keys(result.payerMap || {}).length > 0 && !(eastDouble && !isWinnerEast) && (
        <View style={styles.payerMapSection}>
          <Text style={styles.payerMapTitle(colors)}>Per Player</Text>
          {Object.entries(result.payerMap).map(([pid, amt]) => (
            <Text key={pid} style={styles.resultText(colors)}>
              {pid}: {amt > 0 
                ? `pays ${displayMode === "currency" ? `$${(amt / 100).toFixed(2)}` : `${amt} pts`}`
                : `receives ${displayMode === "currency" ? `$${(Math.abs(amt) / 100).toFixed(2)}` : `${Math.abs(amt)} pts`}`}
            </Text>
          ))}
        </View>
      )}
    </>
  );
}

