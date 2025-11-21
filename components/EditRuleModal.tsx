import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from './ScoreCalculatorCard.styles';
import { Row, Label, Seg } from './shared/CalculatorHelpers';

interface EditRuleModalProps {
  visible: boolean;
  editingRuleKey: string | null;
  editRuleType: 'multiplier' | 'points';
  editRuleValue: string;
  theme: 'light' | 'dark';
  onClose: () => void;
  onTypeChange: (type: 'multiplier' | 'points') => void;
  onValueChange: (value: string) => void;
  onSave: () => void;
}

export default function EditRuleModal({
  visible,
  editingRuleKey,
  editRuleType,
  editRuleValue,
  theme,
  onClose,
  onTypeChange,
  onValueChange,
  onSave,
}: EditRuleModalProps) {
  const colors = getColors(theme);

  const getRuleName = () => {
    switch (editingRuleKey) {
      case 'jokerless':
        return 'Jokerless';
      case 'misnamedJoker':
        return 'Mis-named Joker';
      case 'lastTileFromWall':
        return 'Last Tile from Wall';
      case 'lastTileClaim':
        return 'Last Tile Claim';
      case 'robbingTheJoker':
        return 'Robbing the Joker';
      case 'noExposures':
        return 'No Exposures (Fully Concealed)';
      default:
        return 'Rule';
    }
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
            <Text style={styles.modalTitle(colors)}>Edit {getRuleName()}</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} contentContainerStyle={{ padding: 16 }}>
            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Type</Label>
              <Row style={{ justifyContent: "flex-start" }} colors={colors}>
                <Seg 
                  selected={editRuleType === "multiplier"} 
                  onPress={() => onTypeChange("multiplier")} 
                  colors={colors}
                  theme={theme}
                >
                  Multiplier (×)
                </Seg>
                <Seg 
                  selected={editRuleType === "points"} 
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
                {editRuleType === "multiplier" ? "Multiplier Value" : "Points Value"}
              </Label>
              <TextInput
                keyboardType="decimal-pad"
                value={editRuleValue}
                onChangeText={onValueChange}
                placeholder={editRuleType === "multiplier" ? "e.g., 2" : "e.g., 10"}
                placeholderTextColor={colors.textSecondary}
                style={styles.textInput(colors)}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton(colors), { marginTop: 8 }]}
              onPress={onSave}
            >
              <FontAwesome5 name="save" size={16} color={colors.card} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText(colors, theme)}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

