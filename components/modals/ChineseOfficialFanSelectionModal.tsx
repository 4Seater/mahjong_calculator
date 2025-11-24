import React from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity, TouchableWithoutFeedback, Switch, Alert, Dimensions, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { chineseOfficialFans } from '@/lib/scoring/chineseOfficial/chineseOfficialFans';
import { getColors } from '@/constants/colors';
import type { Fan } from '@/lib/scoring/chineseOfficial/chineseOfficialTypes';

interface ChineseOfficialFanSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFans: Set<string>;
  onFansChange: (fans: Set<string>) => void;
  detectedFanIds: string[];
  flowerCount: string;
  theme: 'light' | 'dark';
}

export default function ChineseOfficialFanSelectionModal({
  visible,
  onClose,
  selectedFans,
  onFansChange,
  detectedFanIds,
  flowerCount,
  theme,
}: ChineseOfficialFanSelectionModalProps) {
  const colors = getColors(theme);

  // Group fans by points
  const groupedByPoints = chineseOfficialFans.reduce((acc, fan) => {
    const points = fan.points;
    if (!acc[points]) acc[points] = [];
    acc[points].push(fan);
    return acc;
  }, {} as Record<number, typeof chineseOfficialFans>);

  // Separate detected fans from all fans
  const detectedFans = detectedFanIds
    .map(id => chineseOfficialFans.find(f => f.id === id))
    .filter((fan): fan is Fan => fan !== undefined);

  const allOtherFans = chineseOfficialFans.filter(f => !detectedFanIds.includes(f.id));

  // Calculate total score (fans + flowers + base)
  const fanPoints = Array.from(selectedFans).reduce((sum, fanId) => {
    const fan = chineseOfficialFans.find(f => f.id === fanId);
    return sum + (fan ? fan.points : 0);
  }, 0);
  const flowerPoints = Number(flowerCount || 0);
  const totalScore = fanPoints + flowerPoints + 8; // Add 8 base points

  const handleFanToggle = (fanId: string, value: boolean) => {
    const newSet = new Set(selectedFans);
    if (value) {
      newSet.add(fanId);
    } else {
      newSet.delete(fanId);
    }
    onFansChange(newSet);
  };

  const isFanDisabled = (fan: Fan): boolean => {
    // If already selected, allow deselection
    if (selectedFans.has(fan.id)) return false;

    // If candidate is impliedBy any already selected fan -> disabled
    if (fan.impliedBy.size > 0) {
      for (const implierId of fan.impliedBy) {
        if (selectedFans.has(implierId)) {
          return true;
        }
      }
    }

    // If candidate incompatibleWith any selected -> disabled
    if (fan.incompatibleWith.size > 0) {
      for (const incompatId of fan.incompatibleWith) {
        if (selectedFans.has(incompatId)) {
          return true;
        }
      }
    }

    // If any selected fan is impliedBy this candidate (i.e., candidate would make selected invalid)
    for (const selectedId of selectedFans) {
      const selectedFan = chineseOfficialFans.find(f => f.id === selectedId);
      if (selectedFan && selectedFan.impliedBy.has(fan.id)) {
        return true;
      }
    }

    return false;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlayBottom(colors)}>
        {/* Close on overlay press */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Modal content — do NOT wrap in Touchable */}
        <View style={styles.modalContent(colors)}>
          <View style={styles.modalHeader(colors)}>
            <Text style={styles.modalTitle(colors)}>Select Fans</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.modalScrollView} 
            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
            bounces={true}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {/* Total Score Display */}
            <View style={{
              padding: 16,
              marginBottom: 16,
              backgroundColor: colors.primaryLight + '20',
              borderRadius: 8,
              marginHorizontal: 4,
              marginTop: 8
            }}>
              <Text style={[styles.modalTitle(colors), { fontSize: 18, textAlign: 'center' }]}>
                Total Points: {totalScore}
              </Text>
              <Text style={[styles.resultText(colors), { textAlign: 'center', marginTop: 4, fontSize: 12 }]}>
                {Array.from(selectedFans).length} fan(s) + {flowerPoints} flower(s) + 8 base
              </Text>
            </View>

            {/* Detected Fans Section (Auto-Detected) - Show First */}
            {detectedFans.length > 0 && (
              <View style={{ marginBottom: 24, paddingHorizontal: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <FontAwesome5 name="magic" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.modalTitle(colors), { fontSize: 18, fontWeight: '700', flex: 1 }]}>
                    Suggested Fans (Auto-Detected)
                  </Text>
                  <Text style={[styles.resultText(colors), { fontSize: 12, color: colors.primary }]}>
                    {detectedFans.length} detected
                  </Text>
                </View>
                {detectedFans.map(fan => {
                  const isSelected = selectedFans.has(fan.id);
                  return (
                    <View
                      key={fan.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        marginBottom: 8,
                        backgroundColor: isSelected ? colors.primaryLight + '30' : colors.inputBackground,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.modalOptionText(colors),
                          isSelected && { color: colors.primary, fontWeight: '600' }
                        ]}>
                          {fan.name}
                        </Text>
                        <Text style={[styles.resultText(colors), { fontSize: 12, marginTop: 2, color: colors.textSecondary }]}>
                          {fan.points} point{fan.points !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <Switch
                        value={isSelected}
                        onValueChange={(value) => handleFanToggle(fan.id, value)}
                        trackColor={{ false: colors.border, true: colors.primaryLight }}
                        thumbColor={isSelected ? colors.primary : colors.textSecondary}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {/* Flower Points Display (Auto-calculated, Non-selectable) */}
            {flowerPoints > 0 && (
              <View style={{ marginBottom: 20, paddingHorizontal: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={[styles.modalTitle(colors), { fontSize: 18, fontWeight: '700' }]}>
                    Flower Tiles (Auto-calculated)
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Flower Points",
                        "Flowers do not count toward the 8-point minimum needed to declare Mahjong. Each flower tile adds +1 point to your total score."
                      );
                    }}
                    style={{ marginLeft: 8, padding: 4 }}
                  >
                    <FontAwesome5 name="info-circle" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: colors.inputBackground,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: 0.6,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalOptionText(colors), { color: colors.textSecondary }]}>
                      Flower Tiles ({flowerPoints})
                    </Text>
                    <Text style={[styles.resultText(colors), { fontSize: 12, color: colors.textSecondary, marginTop: 2 }]}>
                      {flowerPoints} point{flowerPoints !== 1 ? 's' : ''} (auto-calculated)
                    </Text>
                  </View>
                  <FontAwesome5 name="check-circle" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                </View>
              </View>
            )}

            {/* All Other Fans - Group by Points */}
            {allOtherFans.length > 0 && (
              <>
                <View style={{ paddingHorizontal: 4, marginBottom: 12 }}>
                  <Text style={[styles.modalTitle(colors), { fontSize: 18, fontWeight: '700' }]}>
                    All Available Fans
                  </Text>
                </View>
                {Object.keys(groupedByPoints)
                  .map(Number)
                  .sort((a, b) => b - a) // Sort by points descending
                  .map(points => {
                    // Filter to only show fans not in detectedFans
                    const fansInGroup = groupedByPoints[points].filter(f => !detectedFanIds.includes(f.id));
                    if (fansInGroup.length === 0) return null;

                    return (
                      <View key={points} style={{ marginBottom: 20, paddingHorizontal: 4 }}>
                        <Text style={[styles.modalTitle(colors), { marginBottom: 12, fontSize: 16, fontWeight: '600' }]}>
                          {points}-Point Fans
                        </Text>
                        {fansInGroup.map(fan => {
                          const isSelected = selectedFans.has(fan.id);
                          const isDisabled = isFanDisabled(fan);

                          return (
                            <View
                              key={fan.id}
                              style={[
                                {
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  padding: 12,
                                  marginBottom: 8,
                                  backgroundColor: isSelected ? colors.primaryLight + '30' : colors.inputBackground,
                                  borderRadius: 8,
                                  borderWidth: 1,
                                  borderColor: isSelected ? colors.primary : colors.border,
                                },
                                isDisabled && !isSelected && { opacity: 0.45 }
                              ]}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={[
                                  styles.modalOptionText(colors),
                                  isSelected && { color: colors.primary, fontWeight: '600' },
                                  isDisabled && !isSelected && { color: colors.textSecondary }
                                ]}>
                                  {fan.name}
                                </Text>
                                <Text style={[styles.resultText(colors), { fontSize: 12, marginTop: 2, color: colors.textSecondary }]}>
                                  {fan.points} point{fan.points !== 1 ? 's' : ''}
                                </Text>
                              </View>
                              <Switch
                                value={isSelected}
                                onValueChange={(value) => {
                                  if (isDisabled && !value) return; // Don't allow selection if disabled
                                  handleFanToggle(fan.id, value);
                                }}
                                disabled={isDisabled && !isSelected}
                                trackColor={{ false: colors.border, true: colors.primaryLight }}
                                thumbColor={isSelected ? colors.primary : colors.textSecondary}
                              />
                            </View>
                          );
                        })}
                      </View>
                    );
                  })
                  .filter(Boolean)}
              </>
            )}
          </ScrollView>

          {/* Confirmation Button */}
          <View style={{
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.card
          }}>
            <TouchableOpacity
              style={[styles.saveButton(colors), { marginTop: 0 }]}
              onPress={onClose}
            >
              <FontAwesome5 name="check" size={16} color={colors.card} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText(colors, theme)}>Confirm Selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  modalOverlayBottom: (colors: any) => ({
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  }),
  modalContent: (colors: any) => ({
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Dimensions.get('window').height * 0.93,
    flexDirection: 'column' as const,
  }),
  modalHeader: (colors: any) => ({
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexShrink: 0,
  }),
  modalTitle: (colors: any) => ({
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  }),
  modalScrollView: {
    flex: 1,
  },
  modalOptionText: (colors: any) => ({
    fontSize: 16,
    color: colors.text,
    fontWeight: '500' as const,
  }),
  resultText: (colors: any) => ({
    fontSize: 14,
    color: colors.textSecondary,
  }),
  saveButton: (colors: any) => ({
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 12,
  }),
  saveButtonText: (colors: any, theme?: 'light' | 'dark') => ({
    color: theme === 'dark' ? '#FFFFFF' : colors.card,
    fontSize: 16,
    fontWeight: '700' as const,
  }),
};

