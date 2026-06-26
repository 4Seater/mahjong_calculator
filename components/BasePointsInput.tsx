import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { getColors } from '@/constants/colors';
import { styles } from './ScoreCalculatorCard.styles';
import { Label } from './shared/CalculatorHelpers';

interface BasePointsInputProps {
  basePoints: string;
  theme: 'light' | 'dark';
  wallGame?: boolean;
  fromCardSelection?: boolean;
  onBasePointsChange: (value: string) => void;
}

export default function BasePointsInput({
  basePoints,
  theme,
  wallGame = false,
  fromCardSelection = false,
  onBasePointsChange,
}: BasePointsInputProps) {
  const colors = getColors(theme);

  return (
    <View style={{ opacity: wallGame ? 0.5 : 1 }}>
      <Label colors={colors} sub="Auto-filled when you pick a category and line, or type the card value manually">
        Base Points
      </Label>
      {fromCardSelection && basePoints ? (
        <Text style={[styles.labelSubtext(colors), { marginTop: 2, marginBottom: 6 }]}>
          From card — {basePoints} pts (editable)
        </Text>
      ) : (
        <Text style={[styles.labelSubtext(colors), { marginTop: 2, marginBottom: 6 }]}>
          (points or cents)
        </Text>
      )}
      <TextInput
        keyboardType="number-pad"
        value={basePoints}
        onChangeText={wallGame ? undefined : onBasePointsChange}
        editable={!wallGame}
        placeholder="e.g., 25"
        placeholderTextColor={colors.textSecondary}
        style={styles.textInput(colors)}
      />
    </View>
  );
}

