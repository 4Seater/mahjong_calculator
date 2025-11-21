import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from './ScoreCalculatorCard.styles';
import { Label } from './shared/CalculatorHelpers';
import { getCategoryById } from '@/lib/data/handCategories';

interface HandSelectionUIProps {
  selectedCategoryId: string;
  selectedHand: string;
  availableHands: string[];
  showCategoryModal: boolean;
  showHandModal: boolean;
  theme: 'light' | 'dark';
  onShowCategoryModal: () => void;
  onShowHandModal: () => void;
}

export default function HandSelectionUI({
  selectedCategoryId,
  selectedHand,
  availableHands,
  theme,
  onShowCategoryModal,
  onShowHandModal,
}: HandSelectionUIProps) {
  const colors = getColors(theme);

  return (
    <>
      {/* Hand Category Selection */}
      <View>
        <Label colors={colors} sub="Select the category of your hand">Hand Category</Label>
        <TouchableOpacity
          style={styles.dropdownButton(colors)}
          onPress={onShowCategoryModal}
        >
          <Text style={[styles.dropdownText(colors), !selectedCategoryId && styles.dropdownPlaceholder(colors)]}>
            {selectedCategoryId ? getCategoryById(selectedCategoryId)?.name || "Select Category" : "Select Category"}
          </Text>
          <FontAwesome5 name="chevron-down" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Hand Selection - Only show if category is selected */}
      {selectedCategoryId && (
        <View>
          <Label colors={colors} sub="Select the specific line number from the category">Line number</Label>
          <TouchableOpacity
            style={styles.dropdownButton(colors)}
            onPress={() => {
              if (availableHands.length > 0) {
                onShowHandModal();
              } else {
                Alert.alert("No Hands Available", "This category doesn't have any hands available.");
              }
            }}
            disabled={availableHands.length === 0}
          >
            <Text style={[
              styles.dropdownText(colors), 
              !selectedHand && styles.dropdownPlaceholder(colors),
              availableHands.length === 0 && { opacity: 0.5 }
            ]}>
              {selectedHand || (availableHands.length === 0 ? "No hands available" : "Select Line number")}
            </Text>
            <FontAwesome5 name="chevron-down" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

