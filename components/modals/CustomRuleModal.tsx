import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, Dimensions, Switch, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from './ScoreCalculatorCard.styles';
import { Row, Label, Seg } from './shared/CalculatorHelpers';
import { saveCustomRule, getCustomRules, type CustomRule } from '@/lib/storage/customRulesStorage';

interface CustomRuleModalProps {
  visible: boolean;
  editingRule: CustomRule | null;
  title: string;
  description: string;
  winnerBonusType: 'none' | 'points' | 'multiplier';
  winnerBonusValue: string;
  discarderPenaltyEnabled: boolean;
  discarderPenaltyType: 'points' | 'multiplier';
  discarderPenaltyValue: string;
  allPlayerPenaltyEnabled: boolean;
  allPlayerPenaltyType: 'points' | 'multiplier';
  allPlayerPenaltyValue: string;
  theme: 'light' | 'dark';
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onWinnerBonusTypeChange: (type: 'none' | 'points' | 'multiplier') => void;
  onWinnerBonusValueChange: (value: string) => void;
  onDiscarderPenaltyEnabledChange: (enabled: boolean) => void;
  onDiscarderPenaltyTypeChange: (type: 'points' | 'multiplier') => void;
  onDiscarderPenaltyValueChange: (value: string) => void;
  onAllPlayerPenaltyEnabledChange: (enabled: boolean) => void;
  onAllPlayerPenaltyTypeChange: (type: 'points' | 'multiplier') => void;
  onAllPlayerPenaltyValueChange: (value: string) => void;
  onSave: (rule: CustomRule) => Promise<void>;
}

export default function CustomRuleModal({
  visible,
  editingRule,
  title,
  description,
  winnerBonusType,
  winnerBonusValue,
  discarderPenaltyEnabled,
  discarderPenaltyType,
  discarderPenaltyValue,
  allPlayerPenaltyEnabled,
  allPlayerPenaltyType,
  allPlayerPenaltyValue,
  theme,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onWinnerBonusTypeChange,
  onWinnerBonusValueChange,
  onDiscarderPenaltyEnabledChange,
  onDiscarderPenaltyTypeChange,
  onDiscarderPenaltyValueChange,
  onAllPlayerPenaltyEnabledChange,
  onAllPlayerPenaltyTypeChange,
  onAllPlayerPenaltyValueChange,
  onSave,
}: CustomRuleModalProps) {
  const colors = getColors(theme);
  const isEditing = editingRule !== null;

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for the custom rule.");
      return;
    }

    // Validate winner bonus if selected
    if (winnerBonusType !== 'none') {
      if (!winnerBonusValue || Number(winnerBonusValue) <= 0) {
        Alert.alert("Error", "Please enter a valid winner bonus value greater than 0.");
        return;
      }
    }

    // Validate penalties if enabled
    if (discarderPenaltyEnabled && (!discarderPenaltyValue || Number(discarderPenaltyValue) <= 0)) {
      Alert.alert("Error", "Please enter a valid discarder penalty value greater than 0.");
      return;
    }

    if (allPlayerPenaltyEnabled && (!allPlayerPenaltyValue || Number(allPlayerPenaltyValue) <= 0)) {
      Alert.alert("Error", "Please enter a valid all player penalty value greater than 0.");
      return;
    }

    // At least one effect must be enabled
    if (winnerBonusType === 'none' && !discarderPenaltyEnabled && !allPlayerPenaltyEnabled) {
      Alert.alert("Error", "Please enable at least one effect (winner bonus or penalty).");
      return;
    }

    const rule: CustomRule = {
      id: editingRule?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim() || undefined,
      winnerBonus: winnerBonusType !== 'none' ? {
        type: winnerBonusType,
        value: Number(winnerBonusValue)
      } : undefined,
      discarderPenalty: discarderPenaltyEnabled ? {
        enabled: true,
        type: discarderPenaltyType,
        value: Number(discarderPenaltyValue)
      } : undefined,
      allPlayerPenalty: allPlayerPenaltyEnabled ? {
        enabled: true,
        type: allPlayerPenaltyType,
        value: Number(allPlayerPenaltyValue)
      } : undefined,
      createdAt: editingRule?.createdAt || Date.now()
    };

    await onSave(rule);
  };

  // Generate preview text
  const getPreviewText = (): string => {
    const effects: string[] = [];
    if (winnerBonusType !== 'none' && winnerBonusValue) {
      if (winnerBonusType === 'points') {
        effects.push(`+${winnerBonusValue} points to winner`);
      } else {
        effects.push(`×${winnerBonusValue} multiplier to winner`);
      }
    }
    if (discarderPenaltyEnabled && discarderPenaltyValue) {
      effects.push(`-${discarderPenaltyValue} to discarder`);
    }
    if (allPlayerPenaltyEnabled && allPlayerPenaltyValue) {
      effects.push(`-${allPlayerPenaltyValue} to all other players`);
    }
    return effects.length > 0 ? `This rule will: ${effects.join(', ')}` : '';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlayBottom(colors)}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalContent(colors), { height: Dimensions.get('window').height * 0.90 }]}>
          <View style={styles.modalHeader(colors)}>
            <Text style={styles.modalTitle(colors)}>
              {isEditing ? 'Edit Custom Rule' : 'Add Custom Rule'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} contentContainerStyle={{ padding: 16 }}>
            {/* Preview */}
            {getPreviewText() && (
              <View style={{ marginBottom: 16, padding: 12, backgroundColor: colors.inputBackground, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                <Text style={[styles.labelSubtext(colors), { fontStyle: 'italic' }]}>
                  {getPreviewText()}
                </Text>
              </View>
            )}

            {/* SECTION 1: Rule Name */}
            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Rule Name</Label>
              <TextInput
                value={title}
                onChangeText={onTitleChange}
                placeholder="e.g., Special Bonus"
                placeholderTextColor={colors.textSecondary}
                style={styles.textInput(colors)}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Description (Optional)</Label>
              <TextInput
                value={description}
                onChangeText={onDescriptionChange}
                placeholder="Optional description"
                placeholderTextColor={colors.textSecondary}
                style={[styles.textInput(colors), { minHeight: 60, textAlignVertical: 'top' }]}
                multiline
              />
            </View>

            {/* SECTION 2: Winner Gains */}
            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Winner Bonus</Label>
              <Text style={[styles.labelSubtext(colors), { marginBottom: 8 }]}>
                Choose one option for the winner
              </Text>
              <Row style={{ justifyContent: "flex-start", flexWrap: 'wrap' }} colors={colors}>
                <Seg 
                  selected={winnerBonusType === 'none'} 
                  onPress={() => onWinnerBonusTypeChange('none')} 
                  colors={colors}
                  theme={theme}
                  style={{ marginBottom: 8, marginRight: 8 }}
                >
                  None
                </Seg>
                <Seg 
                  selected={winnerBonusType === 'points'} 
                  onPress={() => onWinnerBonusTypeChange('points')} 
                  colors={colors}
                  theme={theme}
                  style={{ marginBottom: 8, marginRight: 8 }}
                >
                  Add Points
                </Seg>
                <Seg 
                  selected={winnerBonusType === 'multiplier'} 
                  onPress={() => onWinnerBonusTypeChange('multiplier')} 
                  colors={colors}
                  theme={theme}
                  style={{ marginBottom: 8 }}
                >
                  Apply Multiplier
                </Seg>
              </Row>
              {winnerBonusType !== 'none' && (
                <View style={{ marginTop: 8 }}>
                  <TextInput
                    keyboardType="decimal-pad"
                    value={winnerBonusValue}
                    onChangeText={onWinnerBonusValueChange}
                    placeholder={winnerBonusType === 'points' ? 'e.g., 10' : 'e.g., 2'}
                    placeholderTextColor={colors.textSecondary}
                    style={styles.textInput(colors)}
                  />
                </View>
              )}
            </View>

            {/* SECTION 3: Penalties */}
            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Penalties</Label>
              <Text style={[styles.labelSubtext(colors), { marginBottom: 12 }]}>
                These can be used together
              </Text>

              {/* Penalty to Discarder */}
              <View style={{ marginBottom: 12, padding: 12, backgroundColor: colors.inputBackground, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                <Row colors={colors}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.labelText(colors)}>Penalty to Discarder</Text>
                  </View>
                  <Switch
                    value={discarderPenaltyEnabled}
                    onValueChange={onDiscarderPenaltyEnabledChange}
                    trackColor={{ false: colors.border, true: colors.gobutton }}
                    thumbColor={discarderPenaltyEnabled ? colors.card : colors.textSecondary}
                  />
                </Row>
                {discarderPenaltyEnabled && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.labelSubtext(colors), { marginBottom: 8 }]}>Penalty Type</Text>
                    <Row style={{ justifyContent: "flex-start", flexWrap: 'wrap' }} colors={colors}>
                      <Seg 
                        selected={discarderPenaltyType === 'points'} 
                        onPress={() => onDiscarderPenaltyTypeChange('points')} 
                        colors={colors}
                        theme={theme}
                        style={{ marginBottom: 8, marginRight: 8 }}
                      >
                        Points (-)
                      </Seg>
                      <Seg 
                        selected={discarderPenaltyType === 'multiplier'} 
                        onPress={() => onDiscarderPenaltyTypeChange('multiplier')} 
                        colors={colors}
                        theme={theme}
                        style={{ marginBottom: 8 }}
                      >
                        Multiplier (×)
                      </Seg>
                    </Row>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={discarderPenaltyValue}
                      onChangeText={onDiscarderPenaltyValueChange}
                      placeholder={discarderPenaltyType === 'points' ? 'e.g., 5' : 'e.g., 0.8'}
                      placeholderTextColor={colors.textSecondary}
                      style={styles.textInput(colors)}
                    />
                  </View>
                )}
              </View>

              {/* Penalty to All Other Players */}
              <View style={{ marginBottom: 12, padding: 12, backgroundColor: colors.inputBackground, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                <Row colors={colors}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.labelText(colors)}>Penalty to All Other Players</Text>
                  </View>
                  <Switch
                    value={allPlayerPenaltyEnabled}
                    onValueChange={onAllPlayerPenaltyEnabledChange}
                    trackColor={{ false: colors.border, true: colors.gobutton }}
                    thumbColor={allPlayerPenaltyEnabled ? colors.card : colors.textSecondary}
                  />
                </Row>
                {allPlayerPenaltyEnabled && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.labelSubtext(colors), { marginBottom: 8 }]}>Penalty Type</Text>
                    <Row style={{ justifyContent: "flex-start", flexWrap: 'wrap' }} colors={colors}>
                      <Seg 
                        selected={allPlayerPenaltyType === 'points'} 
                        onPress={() => onAllPlayerPenaltyTypeChange('points')} 
                        colors={colors}
                        theme={theme}
                        style={{ marginBottom: 8, marginRight: 8 }}
                      >
                        Points (-)
                      </Seg>
                      <Seg 
                        selected={allPlayerPenaltyType === 'multiplier'} 
                        onPress={() => onAllPlayerPenaltyTypeChange('multiplier')} 
                        colors={colors}
                        theme={theme}
                        style={{ marginBottom: 8 }}
                      >
                        Multiplier (×)
                      </Seg>
                    </Row>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={allPlayerPenaltyValue}
                      onChangeText={onAllPlayerPenaltyValueChange}
                      placeholder={allPlayerPenaltyType === 'points' ? 'e.g., 3' : 'e.g., 0.9'}
                      placeholderTextColor={colors.textSecondary}
                      style={styles.textInput(colors)}
                    />
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton(colors), { marginTop: 8 }]}
              onPress={handleSave}
            >
              <FontAwesome5 name="save" size={16} color={colors.card} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText(colors, theme)}>
                {isEditing ? 'Update Custom Rule' : 'Save Custom Rule'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
