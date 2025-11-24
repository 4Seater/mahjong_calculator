import React from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from '../../ScoreCalculatorCard.styles';
import { Row, Label, Seg } from '../../shared/CalculatorHelpers';
import { chineseOfficialFans } from '@/lib/scoring/chineseOfficial/chineseOfficialFans';
import type { Hand, Tile } from '@/lib/scoring/chineseOfficial/tiles';
import { TileInputEngine, getTileDisplayName } from '@/lib/scoring/chineseOfficial/tileInputEngine';
import ChineseOfficialTilePicker from './ChineseOfficialTilePicker';
import ChineseOfficialTileValidation from './ChineseOfficialTileValidation';
import ChineseOfficialFlowerPoints from './ChineseOfficialFlowerPoints';

interface ChineseOfficialModeControlsProps {
  inputMode: 'fanSelection' | 'tileInput';
  selectedFans: Set<string>;
  flowerCount: string;
  isSelfDraw: boolean;
  isConcealed: boolean;
  prevalentWindPung: boolean;
  seatWindPung: boolean;
  showFanModal: boolean;
  hand: Hand | null;
  detectedFanIds: string[];
  manualTiles: Tile[];
  showTilePicker: boolean;
  tileInputError: string | null;
  tileInputEngine: TileInputEngine;
  theme: 'light' | 'dark';
  onInputModeChange: (mode: 'fanSelection' | 'tileInput') => void;
  onShowFanModalChange: (show: boolean) => void;
  onSelectedFansChange: (fans: Set<string>) => void;
  onFlowerCountChange: (count: string) => void;
  onIsSelfDrawChange: (value: boolean) => void;
  onIsConcealedChange: (value: boolean) => void;
  onPrevalentWindPungChange: (value: boolean) => void;
  onSeatWindPungChange: (value: boolean) => void;
  onHandChange: (hand: Hand | null) => void;
  onUseOptimalSolverChange: (value: boolean) => void;
  onDetectedFanIdsChange: (fanIds: string[]) => void;
  onManualTilesChange: (tiles: Tile[]) => void;
  onShowTilePickerChange: (show: boolean) => void;
  onTileInputErrorChange: (error: string | null) => void;
}

export default function ChineseOfficialModeControls({
  inputMode,
  selectedFans,
  flowerCount,
  isSelfDraw,
  isConcealed,
  prevalentWindPung,
  seatWindPung,
  showFanModal,
  hand,
  detectedFanIds,
  manualTiles,
  showTilePicker,
  tileInputError,
  tileInputEngine,
  theme,
  onInputModeChange,
  onShowFanModalChange,
  onSelectedFansChange,
  onFlowerCountChange,
  onIsSelfDrawChange,
  onIsConcealedChange,
  onPrevalentWindPungChange,
  onSeatWindPungChange,
  onHandChange,
  onUseOptimalSolverChange,
  onDetectedFanIdsChange,
  onManualTilesChange,
  onShowTilePickerChange,
  onTileInputErrorChange,
}: ChineseOfficialModeControlsProps) {
  const colors = getColors(theme);

  return (
    <>
      {/* Input Mode Selector */}
      <View style={{ marginTop: 4, marginBottom: 16 }}>
        <Label colors={colors}>Choose Input Mode</Label>
        <Row style={{ justifyContent: "flex-start" }} colors={colors}>
          <Seg 
            selected={inputMode === 'fanSelection'} 
            onPress={() => {
              onInputModeChange('fanSelection');
              onUseOptimalSolverChange(false);
              onHandChange(null as any); // Reset hand when switching modes
            }} 
            colors={colors} 
            theme={theme}
          >
            Fan Selection
          </Seg>
          <Seg 
            selected={inputMode === 'tileInput'} 
            onPress={() => {
              onInputModeChange('tileInput');
              onUseOptimalSolverChange(true);
            }} 
            colors={colors} 
            theme={theme}
          >
            Tile Input
          </Seg>
        </Row>
      </View>

      {/* Fan Selection Mode */}
      {inputMode === 'fanSelection' && (
        <>
          {/* Fan Selection */}
          <View style={{ marginTop: 4 }}>
            <Label colors={colors}>Select Fans</Label>
            <TouchableOpacity
              style={styles.dropdownButton(colors)}
              onPress={() => onShowFanModalChange(true)}
            >
              <Text style={styles.dropdownText(colors)}>
                {selectedFans.size > 0 
                  ? `${selectedFans.size} fan(s) selected`
                  : "Tap to Select Fans"}
              </Text>
              <FontAwesome5 name="chevron-down" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          
            {selectedFans.size > 0 && (
              <View style={{ marginTop: 8 }}>
                {Array.from(selectedFans).map(fanId => {
                  const fan = chineseOfficialFans.find(f => f.id === fanId);
                  if (!fan) return null;
                  return (
                    <View key={fanId} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                      <Text style={styles.resultText(colors)}>
                        {fan.name} ({fan.points}pt)
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const newSet = new Set(selectedFans);
                          newSet.delete(fanId);
                          onSelectedFansChange(newSet);
                        }}
                        style={{ padding: 4 }}
                      >
                        <FontAwesome5 name="times" size={14} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Win Type */}
          <View style={{ marginTop: 16 }}>
            <Label colors={colors}>Win Type</Label>
            <Row style={{ justifyContent: "flex-start" }} colors={colors}>
              <Seg selected={isSelfDraw} onPress={() => onIsSelfDrawChange(true)} colors={colors} theme={theme}>Self-Draw</Seg>
              <Seg selected={!isSelfDraw} onPress={() => onIsSelfDrawChange(false)} colors={colors} theme={theme}>From Discard</Seg>
            </Row>
          </View>

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
        </>
      )}

      {/* Tile Input Mode */}
      {inputMode === 'tileInput' && (
        <>
          {/* Manual Tile Input Section */}
          <View style={{ marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Label colors={colors} sub={`Current hand: ${manualTiles.length} tiles (${manualTiles.filter(t => t.kind.type !== 'flower').length} non-flower)`}>
                Manual Tile Input
              </Label>
              <TouchableOpacity
                onPress={() => onShowTilePickerChange(!showTilePicker)}
                style={{
                  padding: 8,
                  backgroundColor: colors.primary,
                  borderRadius: 6,
                }}
              >
                <Text style={[styles.saveButtonText(colors, theme), { fontSize: 12 }]}>
                  {showTilePicker ? 'Hide' : 'Show'} Picker
                </Text>
              </TouchableOpacity>
            </View>

            {/* Current Hand Display */}
            {manualTiles.length > 0 && (
              <View style={{
                padding: 12,
                backgroundColor: colors.inputBackground,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 12,
              }}>
                <Text style={[styles.resultText(colors), { marginBottom: 8, fontWeight: '600' }]}>
                  Current Hand ({manualTiles.length} tiles):
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {manualTiles.map((tile, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        tileInputEngine.removeTileByIndex(index);
                        const state = tileInputEngine.getState();
                        onManualTilesChange(state.tiles);
                        onTileInputErrorChange(state.errorMessage);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 6,
                        paddingHorizontal: 10,
                        backgroundColor: tile.kind.type === 'flower' ? colors.primaryLight + '30' : colors.card,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text style={[styles.resultText(colors), { fontSize: 12 }]}>
                        {getTileDisplayName(tile)}
                      </Text>
                      <FontAwesome5 name="times" size={10} color={colors.textSecondary} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    tileInputEngine.resetHand();
                    const state = tileInputEngine.getState();
                    onManualTilesChange(state.tiles);
                    onTileInputErrorChange(null);
                  }}
                  style={{ marginTop: 8, alignSelf: 'flex-start' }}
                >
                  <Text style={[styles.resultText(colors), { color: '#f26d66', fontSize: 12 }]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Error Message */}
            {tileInputError && (
              <View style={{
                padding: 10,
                backgroundColor: '#f26d66' + '20',
                borderRadius: 6,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#f26d66',
              }}>
                <Text style={[styles.resultText(colors), { color: '#f26d66', fontSize: 12 }]}>
                  {tileInputError}
                </Text>
              </View>
            )}

            {/* Tile Picker Modal */}
            <ChineseOfficialTilePicker
              visible={showTilePicker}
              tileInputEngine={tileInputEngine}
              manualTiles={manualTiles}
              onTilesChange={onManualTilesChange}
              onErrorChange={onTileInputErrorChange}
              onFlowerCountChange={onFlowerCountChange}
              theme={theme}
            />

            {/* Validate & Process Button and Detected Fans */}
            <ChineseOfficialTileValidation
              tileInputEngine={tileInputEngine}
              chineseOfficialHand={hand}
              detectedFanIds={detectedFanIds}
              chineseOfficialSelectedFans={selectedFans}
              chineseOfficialIsConcealed={isConcealed}
              chineseOfficialIsSelfDraw={isSelfDraw}
              chineseOfficialPrevalentWindPung={prevalentWindPung}
              chineseOfficialSeatWindPung={seatWindPung}
              onHandChange={onHandChange}
              onUseOptimalSolverChange={onUseOptimalSolverChange}
              onFlowerCountChange={onFlowerCountChange}
              onDetectedFanIdsChange={onDetectedFanIdsChange}
              onSelectedFansChange={onSelectedFansChange}
              onErrorChange={onTileInputErrorChange}
              theme={theme}
            />

          </View>

          {/* Win Type */}
          <View style={{ marginTop: 16 }}>
            <Label colors={colors}>Win Type</Label>
            <Row style={{ justifyContent: "flex-start" }} colors={colors}>
              <Seg selected={isSelfDraw} onPress={() => onIsSelfDrawChange(true)} colors={colors} theme={theme}>Self-Draw</Seg>
              <Seg selected={!isSelfDraw} onPress={() => onIsSelfDrawChange(false)} colors={colors} theme={theme}>From Discard</Seg>
            </Row>
          </View>

          {/* Basic Options for Tile Input Mode */}
          <Row colors={colors} style={{ marginTop: 16 }}>
            <Label colors={colors}>Fully Concealed</Label>
            <Switch 
              value={isConcealed} 
              onValueChange={onIsConcealedChange}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={isConcealed ? colors.card : colors.textSecondary}
            />
          </Row>

          {/* Flower Points Section */}
          <ChineseOfficialFlowerPoints
            flowerCount={flowerCount}
            chineseOfficialHand={hand}
            chineseOfficialPrevalentWindPung={prevalentWindPung}
            chineseOfficialSeatWindPung={seatWindPung}
            onFlowerCountChange={onFlowerCountChange}
            onPrevalentWindPungChange={onPrevalentWindPungChange}
            onSeatWindPungChange={onSeatWindPungChange}
            theme={theme}
          />
        </>
      )}
    </>
  );
}

