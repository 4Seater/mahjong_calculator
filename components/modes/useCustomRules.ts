import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getCustomRules, saveCustomRule, type CustomRule } from '@/lib/storage/customRulesStorage';

type CustomRuleType = 'multiplier' | 'points' | 'opponentDeduction' | 'discarderDeduction';

export function useCustomRules() {
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [selectedCustomRuleIds, setSelectedCustomRuleIds] = useState<Set<string>>(new Set());
  const [showCustomRuleModal, setShowCustomRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<CustomRule | null>(null);
  const [newCustomRuleTitle, setNewCustomRuleTitle] = useState<string>("");
  const [newCustomRuleDescription, setNewCustomRuleDescription] = useState<string>("");
  // Winner bonus state
  const [winnerBonusType, setWinnerBonusType] = useState<'none' | 'points' | 'multiplier'>('none');
  const [winnerBonusValue, setWinnerBonusValue] = useState<string>("");
  // Penalties state
  const [discarderPenaltyEnabled, setDiscarderPenaltyEnabled] = useState(false);
  const [discarderPenaltyType, setDiscarderPenaltyType] = useState<'points' | 'multiplier'>('points');
  const [discarderPenaltyValue, setDiscarderPenaltyValue] = useState<string>("");
  const [allPlayerPenaltyEnabled, setAllPlayerPenaltyEnabled] = useState(false);
  const [allPlayerPenaltyType, setAllPlayerPenaltyType] = useState<'points' | 'multiplier'>('points');
  const [allPlayerPenaltyValue, setAllPlayerPenaltyValue] = useState<string>("");
  
  // Rule multiplier/points editing
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [editingRuleKey, setEditingRuleKey] = useState<string | null>(null);
  const [editRuleType, setEditRuleType] = useState<'multiplier' | 'points'>('multiplier');
  const [editRuleValue, setEditRuleValue] = useState<string>("");
  
  // Custom multipliers/points for rules
  const [customRuleValues, setCustomRuleValues] = useState<Record<string, { type: 'multiplier' | 'points', value: number }>>({});

  // Load custom rules on mount
  useEffect(() => {
    const loadCustomRules = async () => {
      const rules = await getCustomRules();
      setCustomRules(rules);
    };
    loadCustomRules();
  }, []);

  // Handle opening edit modal for a rule
  const handleEditRule = (ruleKey: string, defaultType: 'multiplier' | 'points', defaultValue: number) => {
    const custom = customRuleValues[ruleKey];
    setEditingRuleKey(ruleKey);
    setEditRuleType(custom?.type || defaultType);
    setEditRuleValue(custom?.value?.toString() || defaultValue.toString());
    setShowEditRuleModal(true);
  };

  // Handle saving edited rule
  const handleSaveEditRule = () => {
    if (!editingRuleKey || !editRuleValue) return;
    const value = parseFloat(editRuleValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert("Invalid Value", "Please enter a valid positive number.");
      return;
    }
    setCustomRuleValues({
      ...customRuleValues,
      [editingRuleKey]: { type: editRuleType, value }
    });
    setShowEditRuleModal(false);
    setEditingRuleKey(null);
    setEditRuleValue("");
  };

  // Handle saving a custom rule (new or edited)
  const handleSaveCustomRule = async (rule: CustomRule) => {
    await saveCustomRule(rule);
    const updatedRules = await getCustomRules();
    setCustomRules(updatedRules);
    handleCloseCustomRuleModal();
  };

  // Handle closing custom rule modal
  const handleCloseCustomRuleModal = () => {
    setShowCustomRuleModal(false);
    setEditingRule(null);
    setNewCustomRuleTitle("");
    setNewCustomRuleDescription("");
    setWinnerBonusType('none');
    setWinnerBonusValue("");
    setDiscarderPenaltyEnabled(false);
    setDiscarderPenaltyValue("");
    setAllPlayerPenaltyEnabled(false);
    setAllPlayerPenaltyValue("");
  };

  // Handle opening custom rule modal (for creating or editing)
  const handleOpenCustomRuleModal = (ruleToEdit?: CustomRule | null) => {
    if (ruleToEdit) {
      // Editing mode - support both new and legacy formats
      setEditingRule(ruleToEdit);
      setNewCustomRuleTitle(ruleToEdit.title || "");
      setNewCustomRuleDescription(ruleToEdit.description || "");
      
      // Handle new format
      if (ruleToEdit.winnerBonus) {
        setWinnerBonusType(ruleToEdit.winnerBonus.type);
        setWinnerBonusValue(ruleToEdit.winnerBonus.value.toString());
      } else if (ruleToEdit.type === 'multiplier' || ruleToEdit.type === 'points') {
        // Legacy format
        setWinnerBonusType(ruleToEdit.type);
        setWinnerBonusValue(ruleToEdit.value?.toString() || "0");
      } else {
        setWinnerBonusType('none');
        setWinnerBonusValue("");
      }
      
      setDiscarderPenaltyEnabled(ruleToEdit.discarderPenalty?.enabled || false);
      setDiscarderPenaltyType(ruleToEdit.discarderPenalty?.type || 'points');
      setDiscarderPenaltyValue(ruleToEdit.discarderPenalty?.value?.toString() || "");
      
      setAllPlayerPenaltyEnabled(ruleToEdit.allPlayerPenalty?.enabled || false);
      setAllPlayerPenaltyType(ruleToEdit.allPlayerPenalty?.type || 'points');
      setAllPlayerPenaltyValue(ruleToEdit.allPlayerPenalty?.value?.toString() || "");
      
      // Legacy support
      if (ruleToEdit.type === 'discarderDeduction' && ruleToEdit.value) {
        setDiscarderPenaltyEnabled(true);
        setDiscarderPenaltyValue(ruleToEdit.value.toString());
      }
      if (ruleToEdit.type === 'opponentDeduction' && ruleToEdit.value) {
        setAllPlayerPenaltyEnabled(true);
        setAllPlayerPenaltyValue(ruleToEdit.value.toString());
      }
    } else {
      // Creating mode
      setEditingRule(null);
      setNewCustomRuleTitle("");
      setNewCustomRuleDescription("");
      setWinnerBonusType('none');
      setWinnerBonusValue("");
      setDiscarderPenaltyEnabled(false);
      setDiscarderPenaltyType('points');
      setDiscarderPenaltyValue("");
      setAllPlayerPenaltyEnabled(false);
      setAllPlayerPenaltyType('points');
      setAllPlayerPenaltyValue("");
    }
    setShowCustomRuleModal(true);
  };

  return {
    // State
    customRules,
    setCustomRules,
    selectedCustomRuleIds,
    setSelectedCustomRuleIds,
    showCustomRuleModal,
    setShowCustomRuleModal,
    editingRule,
    newCustomRuleTitle,
    setNewCustomRuleTitle,
    newCustomRuleDescription,
    setNewCustomRuleDescription,
    winnerBonusType,
    setWinnerBonusType,
    winnerBonusValue,
    setWinnerBonusValue,
    discarderPenaltyEnabled,
    setDiscarderPenaltyEnabled,
    discarderPenaltyType,
    setDiscarderPenaltyType,
    discarderPenaltyValue,
    setDiscarderPenaltyValue,
    allPlayerPenaltyEnabled,
    setAllPlayerPenaltyEnabled,
    allPlayerPenaltyType,
    setAllPlayerPenaltyType,
    allPlayerPenaltyValue,
    setAllPlayerPenaltyValue,
    showEditRuleModal,
    setShowEditRuleModal,
    editingRuleKey,
    setEditingRuleKey,
    editRuleType,
    setEditRuleType,
    editRuleValue,
    setEditRuleValue,
    customRuleValues,
    setCustomRuleValues,
    // Handlers
    handleEditRule,
    handleSaveEditRule,
    handleSaveCustomRule,
    handleCloseCustomRuleModal,
    handleOpenCustomRuleModal,
  };
}

