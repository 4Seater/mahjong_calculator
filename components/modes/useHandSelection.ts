import { useState, useMemo, useEffect } from 'react';
import { getHandsByCategory, formatHandName } from '@/lib/data/handCategories';

export function useHandSelection() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedHand, setSelectedHand] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showHandModal, setShowHandModal] = useState(false);
  const [handName, setHandName] = useState<string>("");

  // Get available hands for selected category
  const availableHands = useMemo(() => {
    if (!selectedCategoryId) return [];
    return getHandsByCategory(selectedCategoryId);
  }, [selectedCategoryId]);

  // Update hand name when hand is selected
  useEffect(() => {
    if (selectedHand && selectedCategoryId) {
      const formattedName = formatHandName(selectedCategoryId, selectedHand);
      setHandName(formattedName);
    }
  }, [selectedHand, selectedCategoryId]);

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

