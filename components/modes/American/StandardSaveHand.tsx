import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from '../../ScoreCalculatorCard.styles';
import { saveHand } from '@/lib/storage/handStorage';
import type { SavedHand } from '@/lib/types/game';
import type { ScoreResult, WinType } from '@/lib/scoring/types';

interface StandardSaveHandProps {
  handName: string;
  basePoints: string;
  winType: WinType;
  jokerless: boolean;
  singlesAndPairs: boolean;
  noExposures: boolean;
  result: ScoreResult;
  displayMode: 'currency' | 'points';
  mode: string;
  standardWinnerExposureCount: string;
  saveSuccess: boolean;
  theme: 'light' | 'dark';
  onSaveSuccess: (success: boolean) => void;
}

export default function StandardSaveHand({
  handName,
  basePoints,
  winType,
  jokerless,
  singlesAndPairs,
  noExposures,
  result,
  displayMode,
  mode,
  standardWinnerExposureCount,
  saveSuccess,
  theme,
  onSaveSuccess,
}: StandardSaveHandProps) {
  const colors = getColors(theme);

  const handleSave = async () => {
    try {
      const handToSave: SavedHand = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        handName: handName.trim() || "Custom Hand",
        basePoints: Number(basePoints || 0),
        winType,
        jokerless,
        singlesAndPairs,
        noExposures,
        totalToWinner: result.totalToWinner,
        displayMode,
        mode,
        exposurePenalty: result.exposurePenalty,
        winnerExposureCount: Number(standardWinnerExposureCount || 0),
        perLoserAmounts: result.perLoserAmounts,
        isWinner: true, // All saved hands are wins for the user
      };
      await saveHand(handToSave);
      onSaveSuccess(true);
      setTimeout(() => onSaveSuccess(false), 2000);
      Alert.alert("Saved!", "Hand saved successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to save hand. Please try again.");
      console.error("Save error:", error);
    }
  };

  return (
    <View style={[styles.resultsSection(colors), { marginTop: 20 }]}>
      <TouchableOpacity
        style={[styles.saveButton(colors), saveSuccess && styles.saveButtonSuccess(colors)]}
        onPress={handleSave}
      >
        <FontAwesome5 
          name={saveSuccess ? "check" : "save"} 
          size={16} 
          color={colors.card} 
          style={{ marginRight: 8 }} 
        />
        <Text style={styles.saveButtonText(colors, theme)}>
          {saveSuccess ? "Saved!" : "Save Hand"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

