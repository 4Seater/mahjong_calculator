import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { TileInputEngine } from '@/lib/scoring/chineseOfficial/tileInputEngine';
import { isValidHand, detectFans } from '@/lib/scoring/chineseOfficial/handValidator';
import { chineseOfficialFans } from '@/lib/scoring/chineseOfficial/chineseOfficialFans';
import { getColors } from '@/constants/colors';
import type { Hand } from '@/lib/scoring/chineseOfficial/tiles';

interface ChineseOfficialTileValidationProps {
  tileInputEngine: TileInputEngine;
  chineseOfficialHand: Hand | null;
  detectedFanIds: string[];
  chineseOfficialSelectedFans: Set<string>;
  chineseOfficialIsConcealed: boolean;
  chineseOfficialIsSelfDraw: boolean;
  chineseOfficialPrevalentWindPung: boolean;
  chineseOfficialSeatWindPung: boolean;
  onHandChange: (hand: Hand) => void;
  onUseOptimalSolverChange: (value: boolean) => void;
  onFlowerCountChange: (count: string) => void;
  onDetectedFanIdsChange: (fanIds: string[]) => void;
  onSelectedFansChange: (fans: Set<string>) => void;
  onErrorChange: (error: string | null) => void;
  theme: 'light' | 'dark';
}

export default function ChineseOfficialTileValidation({
  tileInputEngine,
  chineseOfficialHand,
  detectedFanIds,
  chineseOfficialSelectedFans,
  chineseOfficialIsConcealed,
  chineseOfficialIsSelfDraw,
  chineseOfficialPrevalentWindPung,
  chineseOfficialSeatWindPung,
  onHandChange,
  onUseOptimalSolverChange,
  onFlowerCountChange,
  onDetectedFanIdsChange,
  onSelectedFansChange,
  onErrorChange,
  theme,
}: ChineseOfficialTileValidationProps) {
  const colors = getColors(theme);

  const handleValidateAndDetect = () => {
    const isValid = tileInputEngine.validateHand();
    const state = tileInputEngine.getState();
    onErrorChange(state.errorMessage);
    
    if (!isValid) {
      Alert.alert("Invalid Hand", state.errorMessage || "Hand is not valid");
      return;
    }
    
    try {
      const hand = tileInputEngine.createHand();
      
      // Validate hand structure
      const validation = isValidHand(hand);
      
      if (!validation.isValid) {
        Alert.alert("Invalid Hand", validation.error || "Hand is not valid");
        return;
      }
      
      onHandChange(hand);
      onUseOptimalSolverChange(true);
      // Update flower count
      onFlowerCountChange(hand.flowerCount.toString());
      
      // Detect all fans using comprehensive detection
      const melds = validation.melds || [];
      const detectedFans = detectFans(hand, melds, {
        isConcealed: chineseOfficialIsConcealed,
        isSelfDraw: chineseOfficialIsSelfDraw,
        prevalentWindPungPresent: chineseOfficialPrevalentWindPung,
        seatWindPungPresent: chineseOfficialSeatWindPung,
      });
      onDetectedFanIdsChange(detectedFans);
      
      // Auto-select detected fans
      onSelectedFansChange(new Set(detectedFans));
      
      const handType = validation.isSpecialHand 
        ? validation.specialHandType === 'sevenPairs' ? 'Seven Pairs' 
        : validation.specialHandType === 'thirteenOrphans' ? 'Thirteen Orphans'
        : 'Standard'
        : 'Standard';
      
      Alert.alert("Success", `Valid hand with ${hand.tiles.length} tiles (${hand.flowerCount} flowers)\nHand Type: ${handType}\nDetected ${detectedFans.length} fan(s)`);
    } catch (error) {
      Alert.alert("Error", `Failed to process hand: ${error}`);
    }
  };

  return (
    <>
      {/* Validate & Process Button */}
      <TouchableOpacity
        style={[styles.saveButton(colors), { marginTop: 12 }]}
        onPress={handleValidateAndDetect}
      >
        <Text style={styles.saveButtonText(colors, theme)}>Validate & Auto-Detect Fans</Text>
      </TouchableOpacity>

      {/* Suggested Fans (from auto-detection) */}
      {chineseOfficialHand && detectedFanIds.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.labelText(colors)}>Detected Fans (Auto-Selected)</Text>
          <View style={{ marginTop: 8 }}>
            {detectedFanIds.map(fanId => {
              const fan = chineseOfficialFans.find(f => f.id === fanId);
              if (!fan) return null;
              const isSelected = chineseOfficialSelectedFans.has(fan.id);
              return (
                <TouchableOpacity
                  key={fan.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                    marginBottom: 6,
                    backgroundColor: isSelected ? colors.primaryLight + '30' : colors.inputBackground,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }}
                  onPress={() => {
                    const newSet = new Set(chineseOfficialSelectedFans);
                    if (isSelected) {
                      newSet.delete(fan.id);
                    } else {
                      newSet.add(fan.id);
                    }
                    onSelectedFansChange(newSet);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalOptionText(colors), isSelected && { color: colors.primary, fontWeight: '600' }]}>
                      {fan.name}
                    </Text>
                    <Text style={[styles.resultText(colors), { fontSize: 12, marginTop: 2 }]}>
                      {fan.points} point{fan.points !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  {isSelected ? (
                    <FontAwesome5 name="check-circle" size={18} color={colors.primary} style={{ marginLeft: 8 }} />
                  ) : (
                    <FontAwesome5 name="circle" size={18} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                  )}
                </TouchableOpacity>
              );
            }).filter(Boolean)}
          </View>
        </View>
      )}
    </>
  );
}

const styles = {
  saveButton: (colors: any) => ({
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 12,
  }),
  saveButtonText: (colors: any, theme?: 'light' | 'dark') => ({
    color: theme === 'dark' ? '#FFFFFF' : colors.card,
    fontSize: 16,
    fontWeight: '700' as const,
  }),
  labelText: (colors: any) => ({
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  }),
  modalOptionText: (colors: any) => ({
    fontSize: 16,
    color: colors.text,
    flex: 1,
  }),
  resultText: (colors: any) => ({
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  }),
};

