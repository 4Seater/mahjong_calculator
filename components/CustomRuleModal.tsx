import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from './ScoreCalculatorCard.styles';
import { Row, Label, Seg } from './shared/CalculatorHelpers';
import { saveCustomRule, getCustomRules, type CustomRule } from '@/lib/storage/customRulesStorage';

interface CustomRuleModalProps {
  visible: boolean;
  title: string;
  description: string;
  type: 'multiplier' | 'points';
  value: string;
  theme: 'light' | 'dark';
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onTypeChange: (type: 'multiplier' | 'points') => void;
  onValueChange: (value: string) => void;
  onSave: (rule: CustomRule) => Promise<void>;
}

export default function CustomRuleModal({
  visible,
  title,
  description,
  type,
  value,
  theme,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onTypeChange,
  onValueChange,
  onSave,
}: CustomRuleModalProps) {
  const colors = getColors(theme);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for the custom rule.");
      return;
    }
    if (!value || Number(value) <= 0) {
      Alert.alert("Error", "Please enter a valid value greater than 0.");
      return;
    }

    const newRule: CustomRule = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      type: type,
      value: Number(value),
      createdAt: Date.now()
    };

    await onSave(newRule);
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
        <View style={[styles.modalContent(colors), { height: Dimensions.get('window').height * 0.90 }]}>
          <View style={styles.modalHeader(colors)}>
            <Text style={styles.modalTitle(colors)}>Add Custom Rule</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} contentContainerStyle={{ padding: 16 }}>
            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Title</Label>
              <TextInput
                value={title}
                onChangeText={onTitleChange}
                placeholder="e.g., Special Bonus"
                placeholderTextColor={colors.textSecondary}
                style={styles.textInput(colors)}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Description</Label>
              <TextInput
                value={description}
                onChangeText={onDescriptionChange}
                placeholder="Optional description"
                placeholderTextColor={colors.textSecondary}
                style={[styles.textInput(colors), { minHeight: 80, textAlignVertical: 'top' }]}
                multiline
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Type</Label>
              <Row style={{ justifyContent: "flex-start" }} colors={colors}>
                <Seg 
                  selected={type === "multiplier"} 
                  onPress={() => onTypeChange("multiplier")} 
                  colors={colors}
                  theme={theme}
                >
                  Multiplier (×)
                </Seg>
                <Seg 
                  selected={type === "points"} 
                  onPress={() => onTypeChange("points")} 
                  colors={colors}
                  theme={theme}
                >
                  Points (+)
                </Seg>
              </Row>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>
                {type === "multiplier" ? "Multiplier Value" : "Points Value"}
              </Label>
              <TextInput
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onValueChange}
                placeholder={type === "multiplier" ? "e.g., 2" : "e.g., 10"}
                placeholderTextColor={colors.textSecondary}
                style={styles.textInput(colors)}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton(colors), { marginTop: 8 }]}
              onPress={handleSave}
            >
              <FontAwesome5 name="save" size={16} color={colors.card} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText(colors, theme)}>Save Custom Rule</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

