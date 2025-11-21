import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomRule {
  id: string;
  title: string;
  description: string;
  type: 'multiplier' | 'points';
  value: number;
  createdAt: number;
}

const CUSTOM_RULES_STORAGE_KEY = '@mahjong_calculator_custom_rules';

export const saveCustomRule = async (rule: CustomRule): Promise<void> => {
  try {
    const existingRules = await getCustomRules();
    // Check if rule with same ID already exists (prevent duplicates)
    const existingIndex = existingRules.findIndex(r => r.id === rule.id);
    let updatedRules: CustomRule[];
    if (existingIndex >= 0) {
      // Update existing rule
      updatedRules = [...existingRules];
      updatedRules[existingIndex] = rule;
    } else {
      // Add new rule
      updatedRules = [...existingRules, rule];
    }
    await AsyncStorage.setItem(CUSTOM_RULES_STORAGE_KEY, JSON.stringify(updatedRules));
  } catch (error) {
    console.error('Error saving custom rule:', error);
    throw error;
  }
};

export const getCustomRules = async (): Promise<CustomRule[]> => {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_RULES_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading custom rules:', error);
    return [];
  }
};

export const deleteCustomRule = async (ruleId: string): Promise<void> => {
  try {
    const rules = await getCustomRules();
    const filtered = rules.filter(r => r.id !== ruleId);
    await AsyncStorage.setItem(CUSTOM_RULES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting custom rule:', error);
    throw error;
  }
};

export const updateCustomRule = async (rule: CustomRule): Promise<void> => {
  try {
    const rules = await getCustomRules();
    const updated = rules.map(r => r.id === rule.id ? rule : r);
    await AsyncStorage.setItem(CUSTOM_RULES_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating custom rule:', error);
    throw error;
  }
};

