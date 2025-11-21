import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { getColors } from '@/constants/colors';
import { styles } from './ScoreCalculatorCard.styles';
import { Label } from './shared/CalculatorHelpers';

interface BasePointsInputProps {
  basePoints: string;
  theme: 'light' | 'dark';
  onBasePointsChange: (value: string) => void;
}

export default function BasePointsInput({
  basePoints,
  theme,
  onBasePointsChange,
}: BasePointsInputProps) {
  const colors = getColors(theme);

  return (
    <View>
      <Label colors={colors} sub="Type the printed value from your NMJL card">Base Points</Label>
      <Text style={[styles.labelSubtext(colors), { marginTop: 2, marginBottom: 6 }]}>
        (points or cents)
      </Text>
      <TextInput
        keyboardType="number-pad"
        value={basePoints}
        onChangeText={onBasePointsChange}
        placeholder="e.g., 25"
        placeholderTextColor={colors.textSecondary}
        style={styles.textInput(colors)}
      />
    </View>
  );
}

