import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from './ScoreCalculatorCard.styles';
import { HAND_CATEGORIES } from '@/lib/data/handCategories';

interface CategorySelectionModalProps {
  visible: boolean;
  selectedCategoryId: string | null;
  theme: 'light' | 'dark';
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategorySelectionModal({
  visible,
  selectedCategoryId,
  theme,
  onClose,
  onSelectCategory,
}: CategorySelectionModalProps) {
  const colors = getColors(theme);

  const handleSelectCategory = (categoryId: string) => {
    onSelectCategory(categoryId);
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
            <Text style={styles.modalTitle(colors)}>Select Category</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView}>
            {HAND_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.modalOption(colors),
                  selectedCategoryId === category.id && styles.modalOptionSelected(colors)
                ]}
                onPress={() => handleSelectCategory(category.id)}
              >
                <Text style={[
                  styles.modalOptionText(colors),
                  selectedCategoryId === category.id && styles.modalOptionTextSelected(colors)
                ]}>
                  {category.name}
                </Text>
                {selectedCategoryId === category.id && (
                  <FontAwesome5 name="check" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

