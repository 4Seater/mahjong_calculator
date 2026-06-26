import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from '../ScoreCalculatorCard.styles';
import type { AmericanHandYear } from '@/lib/data/handCategories';

interface AmericanYearSelectionModalProps {
  visible: boolean;
  currentYear: AmericanHandYear;
  theme: 'light' | 'dark';
  onClose: () => void;
  onSelectYear: (year: AmericanHandYear) => void;
}

const YEAR_OPTIONS: AmericanHandYear[] = ['2026', '2025']; // newest first

export default function AmericanYearSelectionModal({
  visible,
  currentYear,
  theme,
  onClose,
  onSelectYear,
}: AmericanYearSelectionModalProps) {
  const colors = getColors(theme);

  const handleSelectYear = (year: AmericanHandYear) => {
    onSelectYear(year);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlayBottom(colors)}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent(colors)}>
          <View style={styles.modalHeader(colors)}>
            <Text style={styles.modalTitle(colors)}>Select Year</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            {YEAR_OPTIONS.map((year) => {
              const isSelected = currentYear === year;
              return (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.modalOption(colors),
                    isSelected && styles.modalOptionSelected(colors),
                  ]}
                  onPress={() => handleSelectYear(year)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text
                      style={[
                        styles.modalOptionText(colors),
                        isSelected && styles.modalOptionTextSelected(colors),
                      ]}
                    >
                      {year}
                    </Text>
                    {isSelected && <FontAwesome5 name="check" size={16} color={colors.primary} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

