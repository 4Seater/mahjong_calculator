import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedHand } from '../types/game';

const HANDS_STORAGE_KEY = '@mahjong_calculator_hands';

export const saveHand = async (hand: SavedHand): Promise<void> => {
  try {
    const existingHands = await getSavedHands();
    const updatedHands = [...existingHands, hand];
    await AsyncStorage.setItem(HANDS_STORAGE_KEY, JSON.stringify(updatedHands));
  } catch (error) {
    console.error('Error saving hand:', error);
    throw error;
  }
};

export const getSavedHands = async (): Promise<SavedHand[]> => {
  try {
    const data = await AsyncStorage.getItem(HANDS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading hands:', error);
    return [];
  }
};

export const deleteHand = async (handId: string): Promise<void> => {
  try {
    const hands = await getSavedHands();
    const filtered = hands.filter(h => h.id !== handId);
    await AsyncStorage.setItem(HANDS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting hand:', error);
    throw error;
  }
};

export const clearAllHands = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HANDS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing hands:', error);
    throw error;
  }
};

