import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from '../ScoreCalculatorCard.styles';

interface TournamentClearButtonProps {
  theme: 'light' | 'dark';
  onClear: () => void;
}

export default function TournamentClearButton({
  theme,
  onClear,
}: TournamentClearButtonProps) {
  const colors = getColors(theme);

  const handleClear = () => {
    Alert.alert(
      "Clear All",
      "Are you sure you want to clear all tournament calculator entries?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            onClear();
            Alert.alert("Cleared", "All tournament calculator entries have been reset.");
          },
        },
      ]
    );
  };

  return (
    <View style={{ marginTop: 20 }}>
      <TouchableOpacity
        style={[styles.clearButton(colors), { marginTop: 12 }]}
        onPress={handleClear}
      >
        <FontAwesome5 
          name="times-circle" 
          size={16} 
          color="#FFFFFF" 
          style={{ marginRight: 8 }} 
        />
        <Text style={styles.clearButtonText(colors, theme)}>Clear All</Text>
      </TouchableOpacity>
    </View>
  );
}

