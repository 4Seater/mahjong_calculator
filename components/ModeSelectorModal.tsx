import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from './ScoreCalculatorCard.styles';

type CalculatorMode = 'standard' | 'tournament' | 'chineseOfficial';

interface ModeSelectorModalProps {
  visible: boolean;
  currentMode: CalculatorMode;
  theme: 'light' | 'dark';
  onClose: () => void;
  onSelectMode: (mode: CalculatorMode) => void;
}

export default function ModeSelectorModal({
  visible,
  currentMode,
  theme,
  onClose,
  onSelectMode,
}: ModeSelectorModalProps) {
  const colors = getColors(theme);

  const handleSelectMode = (mode: CalculatorMode) => {
    onSelectMode(mode);
    onClose();
  };

  const modes: { id: CalculatorMode; label: string; disabled?: boolean }[] = [
    { id: 'standard', label: 'Standard (NMJL)' },
    { id: 'tournament', label: 'Tournament' },
    { id: 'chineseOfficial', label: 'Chinese Official', disabled: true },
  ];

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
            <Text style={styles.modalTitle(colors)}>Select Calculator Mode</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView}>
            {modes.map((modeOption) => {
              const isDisabled = modeOption.disabled;
              return (
                <TouchableOpacity
                  key={modeOption.id}
                  style={[
                    styles.modalOption(colors),
                    currentMode === modeOption.id && styles.modalOptionSelected(colors),
                    isDisabled && { opacity: 0.5 }
                  ]}
                  onPress={() => !isDisabled && handleSelectMode(modeOption.id)}
                  disabled={isDisabled}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={[
                      styles.modalOptionText(colors),
                      currentMode === modeOption.id && styles.modalOptionTextSelected(colors),
                      isDisabled && { color: colors.textSecondary }
                    ]}>
                      {modeOption.label}
                    </Text>
                    {isDisabled && (
                      <Text style={[styles.modalOptionText(colors), { 
                        marginLeft: 8, 
                        fontSize: 12, 
                        color: colors.textSecondary,
                        fontStyle: 'italic'
                      }]}>
                        (Coming soon)
                      </Text>
                    )}
                  </View>
                  {currentMode === modeOption.id && !isDisabled && (
                    <FontAwesome5 name="check" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

