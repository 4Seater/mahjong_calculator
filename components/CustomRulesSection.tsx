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
  onShowCustomRuleModal: (editingRule?: CustomRule | null) => void;
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
    const rule = customRules.find(r => r.id === ruleId);
    if (!rule) return;

    const newSet = new Set(selectedCustomRuleIds);
    
      if (enabled) {
      // Check for conflicts before adding
      // Rule: Cannot have multiplier and points bonus together
      // Rule: Deductions can be combined with multipliers, points bonuses, or other deductions
      
      // Get winner bonus type (new or legacy format)
      const ruleWinnerBonusType = rule.winnerBonus?.type || 
        (rule.type === 'multiplier' ? 'multiplier' : rule.type === 'points' ? 'points' : null);
      
      // Only check conflicts for multiplier and points winner bonuses
      // Penalties never conflict
      if (ruleWinnerBonusType === 'multiplier') {
        // Check if any selected rule has a points bonus
        const hasPointsBonus = Array.from(selectedCustomRuleIds).some(id => {
          const selectedRule = customRules.find(r => r.id === id);
          const selectedWinnerBonusType = selectedRule?.winnerBonus?.type || 
            (selectedRule?.type === 'multiplier' ? 'multiplier' : selectedRule?.type === 'points' ? 'points' : null);
          return selectedWinnerBonusType === 'points';
        });
        if (hasPointsBonus) {
          Alert.alert(
            "Invalid Combination",
            "You cannot select both a multiplier rule and a points bonus rule at the same time. Please deselect the points bonus rule first."
          );
          return;
        }
      } else if (ruleWinnerBonusType === 'points') {
        // Check if any selected rule has a multiplier
        const hasMultiplier = Array.from(selectedCustomRuleIds).some(id => {
          const selectedRule = customRules.find(r => r.id === id);
          const selectedWinnerBonusType = selectedRule?.winnerBonus?.type || 
            (selectedRule?.type === 'multiplier' ? 'multiplier' : selectedRule?.type === 'points' ? 'points' : null);
          return selectedWinnerBonusType === 'multiplier';
        });
        if (hasMultiplier) {
          Alert.alert(
            "Invalid Combination",
            "You cannot select both a multiplier rule and a points bonus rule at the same time. Please deselect the multiplier rule first."
          );
          return;
        }
      }
      // Rules with only penalties or no winner bonus can always be added
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

      {customRules.map((rule) => {
        const isSelected = selectedCustomRuleIds.has(rule.id);
        // Check if this rule would conflict if enabled
        // Only multiplier and points bonus conflict with each other
        // Get winner bonus type (new or legacy format)
        const ruleWinnerBonusType = rule.winnerBonus?.type || 
          (rule.type === 'multiplier' ? 'multiplier' : rule.type === 'points' ? 'points' : null);
        
        const wouldConflict = !isSelected && ruleWinnerBonusType && (
          (ruleWinnerBonusType === 'multiplier' && Array.from(selectedCustomRuleIds).some(id => {
            const selectedRule = customRules.find(r => r.id === id);
            const selectedWinnerBonusType = selectedRule?.winnerBonus?.type || 
              (selectedRule?.type === 'multiplier' ? 'multiplier' : selectedRule?.type === 'points' ? 'points' : null);
            return selectedWinnerBonusType === 'points';
          })) ||
          (ruleWinnerBonusType === 'points' && Array.from(selectedCustomRuleIds).some(id => {
            const selectedRule = customRules.find(r => r.id === id);
            const selectedWinnerBonusType = selectedRule?.winnerBonus?.type || 
              (selectedRule?.type === 'multiplier' ? 'multiplier' : selectedRule?.type === 'points' ? 'points' : null);
            return selectedWinnerBonusType === 'multiplier';
          }))
        );
        // Only disable if it's a winner bonus conflict (penalties never conflict)
        const isDisabled = wouldConflict && ruleWinnerBonusType !== null;

        return (
          <View key={rule.id} style={{ marginBottom: 12, padding: 12, backgroundColor: colors.inputBackground, borderRadius: 8, borderWidth: 1, borderColor: colors.border, opacity: wouldConflict ? 0.6 : 1 }}>
            <Row colors={colors}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelText(colors)}>{rule.title}</Text>
                {rule.description && (
                  <Text style={[styles.labelSubtext(colors), { marginTop: 4 }]}>{rule.description}</Text>
                )}
              <Text style={[styles.labelSubtext(colors), { marginTop: 2 }]}>
                {(() => {
                  const effects: string[] = [];
                  // New format
                  if (rule.winnerBonus) {
                    if (rule.winnerBonus.type === 'points') {
                      effects.push(`+${rule.winnerBonus.value} points to winner`);
                    } else {
                      effects.push(`×${rule.winnerBonus.value} multiplier to winner`);
                    }
                  }
                  if (rule.discarderPenalty?.enabled) {
                    if (rule.discarderPenalty.type === 'points') {
                      effects.push(`-${rule.discarderPenalty.value} points to discarder`);
                    } else {
                      effects.push(`×${rule.discarderPenalty.value} multiplier to discarder`);
                    }
                  }
                  if (rule.allPlayerPenalty?.enabled) {
                    if (rule.allPlayerPenalty.type === 'points') {
                      effects.push(`-${rule.allPlayerPenalty.value} points to all other players`);
                    } else {
                      effects.push(`×${rule.allPlayerPenalty.value} multiplier to all other players`);
                    }
                  }
                  // Legacy format support
                  if (effects.length === 0 && rule.type) {
                    if (rule.type === 'multiplier' && rule.value) {
                      effects.push(`×${rule.value} multiplier to winner`);
                    } else if (rule.type === 'points' && rule.value) {
                      effects.push(`+${rule.value} points to winner`);
                    } else if (rule.type === 'opponentDeduction' && rule.value) {
                      effects.push(`-${rule.value} from each opponent`);
                    } else if (rule.type === 'discarderDeduction' && rule.value) {
                      effects.push(`-${rule.value} from discarder`);
                    }
                  }
                  return effects.length > 0 ? effects.join(', ') : 'No effects configured';
                })()}
              </Text>
                {wouldConflict && (
                  <Text style={[styles.labelSubtext(colors), { marginTop: 4, color: '#f26d66', fontStyle: 'italic' }]}>
                    Cannot combine with {ruleWinnerBonusType === 'multiplier' ? 'points bonus' : 'multiplier'} rules
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Switch 
                  value={isSelected} 
                  onValueChange={(enabled) => handleToggleRule(rule.id, enabled)}
                  trackColor={{ false: colors.border, true: colors.gobutton }}
                  thumbColor={isSelected ? colors.card : colors.textSecondary}
                  disabled={isDisabled || false}
                />
              <TouchableOpacity
                onPress={() => onShowCustomRuleModal(rule)}
                style={{ padding: 8 }}
              >
                <FontAwesome5 name="edit" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteRule(rule)}
                style={{ padding: 8 }}
              >
                <FontAwesome5 name="trash" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </Row>
        </View>
        );
      })}

      <TouchableOpacity
        onPress={() => onShowCustomRuleModal()}
        style={[styles.addButton(colors), { marginTop: 8 }]}
      >
        <FontAwesome5 name="plus" size={14} color={colors.card} style={{ marginRight: 8 }} />
        <Text style={styles.addButtonText(colors, theme)}>Add Custom Rule</Text>
      </TouchableOpacity>
    </View>
  );
}

