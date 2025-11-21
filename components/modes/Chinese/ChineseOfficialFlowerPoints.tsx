import React from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import type { Hand } from '@/lib/scoring/chineseOfficial/tiles';
import { Row, Label } from '../../shared/CalculatorHelpers';

interface ChineseOfficialFlowerPointsProps {
  flowerCount: string;
  chineseOfficialHand: Hand | null;
  chineseOfficialPrevalentWindPung: boolean;
  chineseOfficialSeatWindPung: boolean;
  onFlowerCountChange: (count: string) => void;
  onPrevalentWindPungChange: (value: boolean) => void;
  onSeatWindPungChange: (value: boolean) => void;
  theme: 'light' | 'dark';
}

export default function ChineseOfficialFlowerPoints({
  flowerCount,
  chineseOfficialHand,
  chineseOfficialPrevalentWindPung,
  chineseOfficialSeatWindPung,
  onFlowerCountChange,
  onPrevalentWindPungChange,
  onSeatWindPungChange,
  theme,
}: ChineseOfficialFlowerPointsProps) {
  const colors = getColors(theme);

  return (
    <>
      {/* Flower Points Section - SwiftUI Style */}
      <View style={{ 
        marginTop: 16, 
        padding: 16, 
        backgroundColor: colors.primaryLight + '15',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryLight + '40',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.labelText(colors), { fontSize: 16, fontWeight: '700' }]}>
            Flower Points: {flowerCount || 0}
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

        {/* Auto-detected flowers display */}
        {chineseOfficialHand && chineseOfficialHand.flowerCount > 0 && (
          <Text style={[styles.resultText(colors), { fontSize: 12, color: colors.textSecondary, marginBottom: 8 }]}>
            Automatically counted: {chineseOfficialHand.flowerCount} flower{chineseOfficialHand.flowerCount !== 1 ? 's' : ''}
          </Text>
        )}
        
        {/* Visual Flower Tiles */}
        {Number(flowerCount || 0) > 0 && (
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            marginBottom: 12,
            padding: 8,
            backgroundColor: colors.inputBackground,
            borderRadius: 6,
          }}>
            {Array.from({ length: Number(flowerCount || 0) }).map((_, index) => (
              <View 
                key={index} 
                style={{
                  width: 36,
                  height: 44,
                  backgroundColor: colors.card,
                  borderRadius: 6,
                  marginRight: 6,
                  marginBottom: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={[styles.resultText(colors), { fontSize: 9, fontWeight: '600' }]}>
                  F{index + 1}
                </Text>
                <Text style={[styles.resultText(colors), { fontSize: 9, color: colors.primary }]}>
                  +1
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Manual Adjustment Stepper */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={[styles.resultText(colors), { fontSize: 14 }]}>
            Adjust Flowers
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => {
                const current = Number(flowerCount || 0);
                if (current > 0) {
                  onFlowerCountChange((current - 1).toString());
                }
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: Number(flowerCount || 0) > 0 ? 1 : 0.5,
              }}
              disabled={Number(flowerCount || 0) === 0}
            >
              <FontAwesome5 name="minus" size={14} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.resultText(colors), { fontSize: 16, fontWeight: '600', minWidth: 30, textAlign: 'center' }]}>
              {flowerCount || 0}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const current = Number(flowerCount || 0);
                if (current < 8) {
                  onFlowerCountChange((current + 1).toString());
                }
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: Number(flowerCount || 0) < 8 ? 1 : 0.5,
              }}
              disabled={Number(flowerCount || 0) >= 8}
            >
              <FontAwesome5 name="plus" size={14} color={colors.card} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Row colors={colors} style={{ marginTop: 16 }}>
        <Label colors={colors}>Prevalent Wind Pung</Label>
        <Switch 
          value={chineseOfficialPrevalentWindPung} 
          onValueChange={onPrevalentWindPungChange}
          trackColor={{ false: colors.border, true: colors.gobutton }}
          thumbColor={chineseOfficialPrevalentWindPung ? colors.card : colors.textSecondary}
        />
      </Row>

      <Row colors={colors}>
        <Label colors={colors}>Seat Wind Pung</Label>
        <Switch 
          value={chineseOfficialSeatWindPung} 
          onValueChange={onSeatWindPungChange}
          trackColor={{ false: colors.border, true: colors.gobutton }}
          thumbColor={chineseOfficialSeatWindPung ? colors.card : colors.textSecondary}
        />
      </Row>
    </>
  );
}

const styles = {
  labelText: (colors: any) => ({
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  }),
  resultText: (colors: any) => ({
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  }),
};

