import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { TileInputEngine, getAllAvailableTiles, getTileDisplayName } from '@/lib/scoring/chineseOfficial/tileInputEngine';
import type { Tile } from '@/lib/scoring/chineseOfficial/tiles';
import { getColors } from '@/constants/colors';

interface ChineseOfficialTilePickerProps {
  visible: boolean;
  tileInputEngine: TileInputEngine;
  manualTiles: Tile[];
  onTilesChange: (tiles: Tile[]) => void;
  onErrorChange: (error: string | null) => void;
  onFlowerCountChange: (count: string) => void;
  theme: 'light' | 'dark';
}

export default function ChineseOfficialTilePicker({
  visible,
  tileInputEngine,
  manualTiles,
  onTilesChange,
  onErrorChange,
  onFlowerCountChange,
  theme,
}: ChineseOfficialTilePickerProps) {
  const colors = getColors(theme);
  const availableTiles = getAllAvailableTiles();

  if (!visible) return null;

  return (
    <View style={{
      marginTop: 12,
      padding: 12,
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: 300,
    }}>
      <Text style={[styles.resultText(colors), { marginBottom: 8, fontWeight: '600' }]}>
        Select Tiles:
      </Text>
      <ScrollView style={{ maxHeight: 250 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {availableTiles.map((tile, index) => {
            const count = tileInputEngine.getTileCount(tile);
            const canAdd = tile.kind.type === 'flower' || count < 4;
            const nonFlowerCount = manualTiles.filter(t => t.kind.type !== 'flower').length;
            const canAddNonFlower = tile.kind.type === 'flower' || nonFlowerCount < 14;
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (!canAdd || !canAddNonFlower) return;
                  const result = tileInputEngine.addTile(tile);
                  const state = tileInputEngine.getState();
                  onTilesChange(state.tiles);
                  onErrorChange(result.error || null);
                  
                  // Auto-update flower count
                  const flowerCount = tileInputEngine.getFlowerCount();
                  onFlowerCountChange(flowerCount.toString());
                }}
                disabled={!canAdd || !canAddNonFlower}
                style={{
                  padding: 8,
                  paddingHorizontal: 12,
                  backgroundColor: canAdd && canAddNonFlower ? colors.card : colors.border,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: count > 0 ? colors.primary : colors.border,
                  opacity: canAdd && canAddNonFlower ? 1 : 0.5,
                }}
              >
                <Text style={[styles.resultText(colors), { fontSize: 11 }]}>
                  {getTileDisplayName(tile)}
                  {count > 0 && ` (${count})`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  resultText: (colors: any) => ({
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  }),
};

