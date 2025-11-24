import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from '../../ScoreCalculatorCard.styles';
import type { ChineseOfficialResult } from '@/lib/scoring/chineseOfficial/chineseOfficialTypes';
import type { Hand } from '@/lib/scoring/chineseOfficial/tiles';
import ChineseOfficialClearButton from './ChineseOfficialClearButton';

interface ChineseOfficialResultDisplayProps {
  result: ChineseOfficialResult | null;
  inputMode: 'fanSelection' | 'tileInput';
  hand: Hand | null;
  isSelfDraw: boolean;
  discarderId?: string;
  displayMode: 'currency' | 'points';
  theme: 'light' | 'dark';
  onClear: () => void;
}

export default function ChineseOfficialResultDisplay({
  result,
  inputMode,
  hand,
  isSelfDraw,
  discarderId,
  displayMode,
  theme,
  onClear,
}: ChineseOfficialResultDisplayProps) {
  const colors = getColors(theme);

  if (!result) return null;

  return (
    <>
      <Text style={styles.resultsTitle(colors)}>
        {inputMode === 'tileInput' && hand 
          ? "Optimal Score (Auto-Detected)" 
          : "Chinese Official Breakdown"}
      </Text>
      {result && (
        <>
          {/* Active Fans List */}
          <View style={{ marginTop: 8 }}>
            <Text style={styles.resultText(colors)}>
              {inputMode === 'tileInput' && hand 
                ? "Detected Fans:" 
                : "Selected Fans:"}
            </Text>
            {result.chosenFans.length > 0 ? (
              result.chosenFans.map(fan => (
                <View key={fan.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginLeft: 8 }}>
                  <FontAwesome5 name="check-circle" size={12} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.resultText(colors), { marginLeft: 0 }]}>
                    {fan.name} ({fan.points}pt)
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.resultText(colors), { marginLeft: 8, fontStyle: 'italic' }]}>
                No fans detected/selected
              </Text>
            )}

            {/* Flower Tiles (Auto-calculated, Greyed Out) */}
            {result.flowerPoints > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 4, marginLeft: 8, opacity: 0.6 }}>
                <FontAwesome5 name="check-circle" size={12} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={[styles.resultText(colors), { marginLeft: 0, color: colors.textSecondary }]}>
                  Flower Tiles ({result.flowerPoints})
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Flower Points",
                      "Flowers do not count toward the 8-point minimum needed to declare Mahjong. Each flower tile adds +1 point to your total score."
                    );
                  }}
                  style={{ marginLeft: 8, padding: 4 }}
                >
                  <FontAwesome5 name="info-circle" size={12} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Flower Points Visual Display */}
          {result.flowerPoints > 0 && (
            <View style={{ marginTop: 12, padding: 12, backgroundColor: colors.inputBackground, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.resultText(colors), { fontWeight: '600', opacity: 0.7 }]}>
                  Flower Tiles: {result.flowerPoints}
                </Text>
              </View>
              
              {/* Visual Flower Tiles */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                {Array.from({ length: result.flowerPoints }).map((_, index) => (
                  <View 
                    key={index} 
                    style={{
                      width: 36,
                      height: 44,
                      backgroundColor: colors.card,
                      borderRadius: 6,
                      marginRight: 6,
                      marginBottom: 6,
                      borderWidth: 1,
                      borderColor: colors.border,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={[styles.resultText(colors), { fontSize: 9, fontWeight: '600' }]}>
                      F{index + 1}
                    </Text>
                    <Text style={[styles.resultText(colors), { fontSize: 9, color: colors.primary }]}>
                      +1
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Points Summary */}
          <View style={{ marginTop: 16, padding: 12, backgroundColor: colors.inputBackground, borderRadius: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={styles.resultText(colors)}>Fan points:</Text>
              <Text style={[styles.resultText(colors), { fontWeight: '600' }]}>
                {result.fanPointsSum}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={styles.resultText(colors)}>Flower points:</Text>
              <Text style={[styles.resultText(colors), { fontWeight: '600' }]}>
                {result.flowerPoints}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={[styles.resultText(colors), { fontWeight: '700', fontSize: 16 }]}>Total points:</Text>
              <Text style={[styles.resultText(colors), { fontWeight: '700', fontSize: 16, color: colors.primary }]}>
                {result.totalPoints}
              </Text>
            </View>
          </View>

          {/* Payment Breakdown */}
          <View style={styles.paymentSection}>
            {isSelfDraw ? (
              <Text style={styles.paymentText(colors)}>
                {displayMode === "currency"
                  ? `Each opponent pays: $${((result.totalPoints + 8) / 100).toFixed(2)}`
                  : `Each opponent: -${result.totalPoints + 8} pts`}
              </Text>
            ) : (
              <>
                {discarderId && (
                  <Text style={styles.paymentText(colors)}>
                    {displayMode === "currency"
                      ? `Discarder pays: $${((result.totalPoints + 8) / 100).toFixed(2)}`
                      : `Discarder: -${result.totalPoints + 8} pts`}
                  </Text>
                )}
                <Text style={styles.paymentText(colors)}>
                  {displayMode === "currency"
                    ? `Each other player pays: $${(8 / 100).toFixed(2)}`
                    : `Each other player: -8 pts`}
                </Text>
              </>
            )}
            <Text style={styles.totalText(colors, theme)}>
              Total to Winner: {displayMode === "currency"
                ? `$${(result.totalToWinner / 100).toFixed(2)}`
                : `${result.totalToWinner} pts`}
            </Text>
          </View>

          {/* Clear Button */}
          <ChineseOfficialClearButton
            theme={theme}
            onClear={onClear}
          />
        </>
      )}
    </>
  );
}

