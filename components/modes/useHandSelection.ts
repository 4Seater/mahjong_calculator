import { useState, useMemo, useEffect } from 'react';
import {
  getHandsByCategory,
  formatHandName,
  type HandCardYear,
  type CalculatorCardSet,
} from '@/lib/data/handData';

export function useHandSelection(handYear: HandCardYear, cardSet: CalculatorCardSet) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedHand, setSelectedHand] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showHandModal, setShowHandModal] = useState(false);
  const [handName, setHandName] = useState<string>("");

  // When the card year or card set changes, reset selections.
  useEffect(() => {
    setSelectedCategoryId("");
    setSelectedHand("");
    setHandName("");
    setShowCategoryModal(false);
    setShowHandModal(false);
  }, [handYear, cardSet]);

  const availableHands = useMemo(() => {
    if (!selectedCategoryId) return [];
    return getHandsByCategory(selectedCategoryId, handYear, cardSet);
  }, [selectedCategoryId, handYear, cardSet]);

  useEffect(() => {
    if (selectedHand && selectedCategoryId) {
      const formattedName = formatHandName(selectedCategoryId, selectedHand, handYear, cardSet);
      setHandName(formattedName);
    }
  }, [selectedHand, selectedCategoryId, handYear, cardSet]);

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
