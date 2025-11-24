import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from './ScoreCalculatorCard.styles';
import { getCategoryById, formatHandName } from '@/lib/data/handCategories';

interface HandSelectionModalProps {
  visible: boolean;
  selectedCategoryId: string | null;
  selectedHand: string | null;
  availableHands: string[];
  theme: 'light' | 'dark';
  onClose: () => void;
  onSelectHand: (handNumber: string) => void;
}

export default function HandSelectionModal({
  visible,
  selectedCategoryId,
  selectedHand,
  availableHands,
  theme,
  onClose,
  onSelectHand,
}: HandSelectionModalProps) {
  const colors = getColors(theme);

  const handleSelectHand = (handNumber: string) => {
    onSelectHand(handNumber);
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
            <Text style={styles.modalTitle(colors)}>
              Select Hand {selectedCategoryId ? `(${getCategoryById(selectedCategoryId)?.name})` : ''}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView}>
            {availableHands.length === 0 ? (
              <View style={styles.modalOption(colors)}>
                <Text style={styles.modalOptionText(colors)}>
                  No hands available in this category.
                </Text>
              </View>
            ) : (
              availableHands.map((handNumber) => {
                const formattedName = formatHandName(selectedCategoryId, handNumber);
                return (
                  <TouchableOpacity
                    key={handNumber}
                    style={[
                      styles.modalOption(colors),
                      selectedHand === handNumber && styles.modalOptionSelected(colors)
                    ]}
                    onPress={() => handleSelectHand(handNumber)}
                  >
                    <Text style={[
                      styles.modalOptionText(colors),
                      selectedHand === handNumber && styles.modalOptionTextSelected(colors)
                    ]}>
                      {formattedName}
                    </Text>
                    {selectedHand === handNumber && (
                      <FontAwesome5 name="check" size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

