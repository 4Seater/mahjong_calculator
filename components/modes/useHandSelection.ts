import { useState, useMemo, useEffect } from 'react';
import { getHandsByCategory, formatHandName, type AmericanHandYear } from '@/lib/data/handCategories';

export function useHandSelection(handYear: AmericanHandYear) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedHand, setSelectedHand] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showHandModal, setShowHandModal] = useState(false);
  const [handName, setHandName] = useState<string>("");

  // When the card year changes, the available Hand Categories change too.
  // Reset any previously-selected category/hand that may no longer exist.
  useEffect(() => {
    setSelectedCategoryId("");
    setSelectedHand("");
    setHandName("");
    setShowCategoryModal(false);
    setShowHandModal(false);
  }, [handYear]);

  // Get available hands for selected category
  const availableHands = useMemo(() => {
    if (!selectedCategoryId) return [];
    return getHandsByCategory(selectedCategoryId, handYear);
  }, [selectedCategoryId, handYear]);

  // Update hand name when hand is selected
  useEffect(() => {
    if (selectedHand && selectedCategoryId) {
      const formattedName = formatHandName(selectedCategoryId, selectedHand, handYear);
      setHandName(formattedName);
    }
  }, [selectedHand, selectedCategoryId, handYear]);

  // Reset hand selection when category changes
  useEffect(() => {
    setSelectedHand("");
    setHandName("");
  }, [selectedCategoryId]);

  return {
    selectedCategoryId,
    setSelectedCategoryId,
    selectedHand,
    setSelectedHand,
    showCategoryModal,
    setShowCategoryModal,
    showHandModal,
    setShowHandModal,
    handName,
    setHandName,
    availableHands,
  };
}

