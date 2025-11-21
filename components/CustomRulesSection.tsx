import React from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from './ScoreCalculatorCard.styles';
import { Row, Label } from './shared/CalculatorHelpers';
import { deleteCustomRule, getCustomRules, type CustomRule } from '@/lib/storage/customRulesStorage';

interface CustomRulesSectionProps {
  customRules: CustomRule[];
  selectedCustomRuleIds: Set<string>;
  theme: 'light' | 'dark';
  onSelectedCustomRuleIdsChange: (ids: Set<string>) => void;
  onCustomRulesChange: (rules: CustomRule[]) => void;
  onShowCustomRuleModal: () => void;
}

export default function CustomRulesSection({
  customRules,
  selectedCustomRuleIds,
  theme,
  onSelectedCustomRuleIdsChange,
  onCustomRulesChange,
  onShowCustomRuleModal,
}: CustomRulesSectionProps) {
  const colors = getColors(theme);

  const handleDeleteRule = async (rule: CustomRule) => {
    Alert.alert(
      "Delete Custom Rule",
      `Are you sure you want to delete "${rule.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCustomRule(rule.id);
            const updatedRules = await getCustomRules();
            onCustomRulesChange(updatedRules);
            const newSet = new Set(selectedCustomRuleIds);
            newSet.delete(rule.id);
            onSelectedCustomRuleIdsChange(newSet);
          }
        }
      ]
    );
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    const newSet = new Set(selectedCustomRuleIds);
    if (enabled) {
      newSet.add(ruleId);
    } else {
      newSet.delete(ruleId);
    }
    onSelectedCustomRuleIdsChange(newSet);
  };

  return (
    <View style={{ marginTop: 16, paddingTop: 16, borderTopColor: colors.border, borderTopWidth: 1 }}>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Label colors={colors}>Custom Rules</Label>
      </View>

      {customRules.map((rule) => (
        <View key={rule.id} style={{ marginBottom: 12, padding: 12, backgroundColor: colors.inputBackground, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
          <Row colors={colors}>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelText(colors)}>{rule.title}</Text>
              {rule.description && (
                <Text style={[styles.labelSubtext(colors), { marginTop: 4 }]}>{rule.description}</Text>
              )}
              <Text style={[styles.labelSubtext(colors), { marginTop: 2 }]}>
                {rule.type === 'multiplier' ? `×${rule.value}` : `+${rule.value} points`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Switch 
                value={selectedCustomRuleIds.has(rule.id)} 
                onValueChange={(enabled) => handleToggleRule(rule.id, enabled)}
                trackColor={{ false: colors.border, true: colors.gobutton }}
                thumbColor={selectedCustomRuleIds.has(rule.id) ? colors.card : colors.textSecondary}
              />
              <TouchableOpacity
                onPress={() => handleDeleteRule(rule)}
                style={{ padding: 8 }}
              >
                <FontAwesome5 name="trash" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </Row>
        </View>
      ))}

      <TouchableOpacity
        onPress={onShowCustomRuleModal}
        style={[styles.addButton(colors), { marginTop: 8 }]}
      >
        <FontAwesome5 name="plus" size={14} color={colors.card} style={{ marginRight: 8 }} />
        <Text style={styles.addButtonText(colors, theme)}>Add Custom Rule</Text>
      </TouchableOpacity>
    </View>
  );
}

