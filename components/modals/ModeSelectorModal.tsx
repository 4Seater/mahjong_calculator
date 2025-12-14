import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from '../ScoreCalculatorCard.styles';

type CalculatorMode = 'standard' | 'tournament' | 'chineseOfficial';
type AmericanSubMode = 'standard' | 'other';

interface ModeSelectorModalProps {
  visible: boolean;
  currentMode: CalculatorMode;
  currentAmericanSubMode: AmericanSubMode;
  theme: 'light' | 'dark';
  onClose: () => void;
  onSelectMode: (mode: CalculatorMode) => void;
  onSelectAmericanSubMode: (subMode: AmericanSubMode) => void;
}

export default function ModeSelectorModal({
  visible,
  currentMode,
  currentAmericanSubMode,
  theme,
  onClose,
  onSelectMode,
  onSelectAmericanSubMode,
}: ModeSelectorModalProps) {
  const colors = getColors(theme);
  const [showAmericanSubmenu, setShowAmericanSubmenu] = useState(false);

  const handleSelectMode = (mode: CalculatorMode) => {
    if (mode === 'standard') {
      // Show submenu for American mode
      setShowAmericanSubmenu(true);
    } else {
      onSelectMode(mode);
      onClose();
    }
  };

  const handleSelectAmericanSubmode = (submode: AmericanSubMode) => {
    if (submode === 'standard') {
      onSelectAmericanSubMode(submode);
      onSelectMode('standard');
      onClose();
    }
    // 'other' is disabled, so do nothing
  };

  const americanSubmodes: { id: AmericanSubMode; label: string; disabled?: boolean }[] = [
    { id: 'standard', label: 'Standard (NMJL)' },
    { id: 'other', label: 'Other', disabled: true },
  ];

  const modes: { id: CalculatorMode; label: string; disabled?: boolean }[] = [
    { id: 'standard', label: 'American' },
    { id: 'tournament', label: 'Tournament' },
  ];

  // Reset submenu when modal closes
  React.useEffect(() => {
    if (!visible) {
      setShowAmericanSubmenu(false);
    }
  }, [visible]);

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
              {showAmericanSubmenu ? 'Select American Mode' : 'Select Calculator Mode'}
            </Text>
            <TouchableOpacity onPress={showAmericanSubmenu ? () => setShowAmericanSubmenu(false) : onClose}>
              <FontAwesome5 name={showAmericanSubmenu ? "arrow-left" : "times"} size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView}>
            {showAmericanSubmenu ? (
              // American submenu
              <>
                {americanSubmodes.map((submodeOption) => {
                  const isDisabled = submodeOption.disabled;
                  const isSelected = currentMode === 'standard' && submodeOption.id === currentAmericanSubMode;
                  return (
                    <TouchableOpacity
                      key={submodeOption.id}
                      style={[
                        styles.modalOption(colors),
                        isSelected && styles.modalOptionSelected(colors),
                        isDisabled && { opacity: 0.5 }
                      ]}
                      onPress={() => !isDisabled && handleSelectAmericanSubmode(submodeOption.id)}
                      disabled={isDisabled}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={[
                          styles.modalOptionText(colors),
                          isSelected && styles.modalOptionTextSelected(colors),
                          isDisabled && { color: colors.textSecondary }
                        ]}>
                          {submodeOption.label}
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
                      {isSelected && !isDisabled && (
                        <FontAwesome5 name="check" size={16} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : (
              // Main mode selector
              <>
                {modes.map((modeOption) => {
                  const isDisabled = modeOption.disabled;
                  const isSelected = currentMode === modeOption.id;
                  return (
                    <TouchableOpacity
                      key={modeOption.id}
                      style={[
                        styles.modalOption(colors),
                        isSelected && styles.modalOptionSelected(colors),
                        isDisabled && { opacity: 0.5 }
                      ]}
                      onPress={() => !isDisabled && handleSelectMode(modeOption.id)}
                      disabled={isDisabled}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={[
                          styles.modalOptionText(colors),
                          isSelected && styles.modalOptionTextSelected(colors),
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
                        {modeOption.id === 'standard' && !isDisabled && (
                          <FontAwesome5 name="chevron-right" size={14} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                        )}
                      </View>
                      {isSelected && !isDisabled && modeOption.id !== 'standard' && (
                        <FontAwesome5 name="check" size={16} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

