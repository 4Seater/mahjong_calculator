import React from 'react';
import { View, Text, TextInput, Switch } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from '../ScoreCalculatorCard.styles';
import { Row, Label, Seg, RowWithEdit } from '../shared/CalculatorHelpers';
import type { WinType } from '@/lib/scoring/types';
import CustomRulesSection from '../CustomRulesSection';
import type { CustomRule } from '@/lib/storage/customRulesStorage';

interface StandardModeControlsProps {
  winType: WinType;
  jokerless: boolean;
  misnamedJoker: boolean;
  noExposures: boolean;
  exposurePenaltyEnabled: boolean;
  exposurePenaltyPerExposure: string;
  standardWinnerExposureCount: string;
  lastTileFromWall: boolean;
  lastTileClaim: boolean;
  robbingTheJoker: boolean;
  eastDouble: boolean;
  isWinnerEast: boolean;
  numPlayers: number;
  customRules: CustomRule[];
  selectedCustomRuleIds: Set<string>;
  customRuleValues: Record<string, { type: 'multiplier' | 'points', value: number }>;
  theme: 'light' | 'dark';
  onWinTypeChange: (winType: WinType) => void;
  onJokerlessChange: (value: boolean) => void;
  onMisnamedJokerChange: (value: boolean) => void;
  onNoExposuresChange: (value: boolean) => void;
  onExposurePenaltyEnabledChange: (value: boolean) => void;
  onExposurePenaltyPerExposureChange: (value: string) => void;
  onStandardWinnerExposureCountChange: (value: string) => void;
  onLastTileFromWallChange: (value: boolean) => void;
  onLastTileClaimChange: (value: boolean) => void;
  onRobbingTheJokerChange: (value: boolean) => void;
  onEastDoubleChange: (value: boolean) => void;
  onIsWinnerEastChange: (value: boolean) => void;
  onNumPlayersChange: (value: number) => void;
  onSelectedCustomRuleIdsChange: (ids: Set<string>) => void;
  onCustomRulesChange: (rules: CustomRule[]) => void;
  onShowCustomRuleModal: () => void;
  onEditRule: (ruleKey: string, defaultType: 'multiplier' | 'points', defaultValue: number) => void;
}

export default function StandardModeControls({
  winType,
  jokerless,
  misnamedJoker,
  noExposures,
  exposurePenaltyEnabled,
  exposurePenaltyPerExposure,
  standardWinnerExposureCount,
  lastTileFromWall,
  lastTileClaim,
  robbingTheJoker,
  eastDouble,
  isWinnerEast,
  numPlayers,
  customRules,
  selectedCustomRuleIds,
  customRuleValues,
  theme,
  onWinTypeChange,
  onJokerlessChange,
  onMisnamedJokerChange,
  onNoExposuresChange,
  onExposurePenaltyEnabledChange,
  onExposurePenaltyPerExposureChange,
  onStandardWinnerExposureCountChange,
  onLastTileFromWallChange,
  onLastTileClaimChange,
  onRobbingTheJokerChange,
  onEastDoubleChange,
  onIsWinnerEastChange,
  onNumPlayersChange,
  onSelectedCustomRuleIdsChange,
  onCustomRulesChange,
  onShowCustomRuleModal,
  onEditRule,
}: StandardModeControlsProps) {
  const colors = getColors(theme);

  return (
    <>
      {/* Win Type */}
      <View style={{ marginTop: 4 }}>
        <Label colors={colors}>Win Type</Label>
        <Row style={{ justifyContent: "flex-start" }} colors={colors}>
          <Seg selected={winType === "self_pick"} onPress={() => onWinTypeChange("self_pick")} colors={colors} theme={theme}>Self-Pick</Seg>
          <Seg selected={winType === "discard"} onPress={() => onWinTypeChange("discard")} colors={colors} theme={theme}>From Discard</Seg>
        </Row>
      </View>

      {/* Standard Rules */}
      <View style={{ marginTop: 8, paddingTop: 8, borderTopColor: colors.border, borderTopWidth: 1 }}>
        {/* Jokerless */}
        <RowWithEdit 
          colors={colors} 
          onEdit={() => onEditRule('jokerless', 'multiplier', 2)}
          editKey="jokerless"
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub={`No jokers anywhere in the hand (${customRuleValues.jokerless?.type === 'points' ? '+' : '×'}${customRuleValues.jokerless?.value || 2}).`}>
              Jokerless
            </Label>
          </View>
          <Switch 
            value={jokerless} 
            onValueChange={onJokerlessChange}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={jokerless ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>

        {/* Mis-named Joker */}
        <RowWithEdit 
          colors={colors} 
          onEdit={() => onEditRule('misnamedJoker', 'multiplier', 4)}
          editKey="misnamedJoker"
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub={`If a joker is discarded and mis-named, it may be called for mahjong. The multiplier is ${customRuleValues.misnamedJoker?.value || 4}× to the discarder.`}>
              Mis-named Joker
            </Label>
          </View>
          <Switch 
            value={misnamedJoker} 
            onValueChange={onMisnamedJokerChange}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={misnamedJoker ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>
      </View>

      {/* Optional House Rules */}
      <View style={{ marginTop: 8, paddingTop: 8, borderTopColor: colors.border, borderTopWidth: 1 }}>
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Label colors={colors}>Optional House Rules</Label>
        </View>

        {/* No Exposures */}
        <View style={{ marginTop: 8 }}>
          <RowWithEdit 
            colors={colors} 
            onEdit={() => onEditRule('noExposures', 'multiplier', 2)}
            editKey="noExposures"
          >
            <View style={{ flex: 1 }}>
              <Label colors={colors} sub="Award for a fully concealed win">
                No Exposures (Fully Concealed)
              </Label>
            </View>
            <Switch 
              value={noExposures} 
              onValueChange={onNoExposuresChange}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={noExposures ? colors.card : colors.textSecondary}
            />
          </RowWithEdit>
        </View>

        {/* Exposure Penalty */}
        <View style={{ marginTop: 8 }}>
          <RowWithEdit colors={colors} onEdit={undefined} editKey={null}>
            <View style={{ flex: 1 }}>
              <Label colors={colors} sub={noExposures ? "Cannot apply exposure penalty when no exposures are present" : "Penalty per exposure"}>Exposure Penalty</Label>
            </View>
            <Switch 
              value={exposurePenaltyEnabled} 
              onValueChange={onExposurePenaltyEnabledChange}
              disabled={noExposures}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={exposurePenaltyEnabled ? colors.card : colors.textSecondary}
            />
            {/* Invisible placeholder to align with other toggles that have edit icons */}
            <View style={{ padding: 8, marginLeft: 8, width: 30 }}>
              <FontAwesome5 name="edit" size={14} color="transparent" />
            </View>
          </RowWithEdit>
          {exposurePenaltyEnabled && (
            <View style={{ marginTop: 8, padding: 12, backgroundColor: colors.inputBackground, borderRadius: 8 }}>
              {/* Winner Exposure Count (for exposure penalty) */}
              <View style={{ marginBottom: 12 }}>
                <Label colors={colors} sub="Number of exposures on winner's rack (ie, number of pungs, kongs, and quints not individual tiles)">Winner's Exposure Count</Label>
                <TextInput
                  keyboardType="number-pad"
                  value={standardWinnerExposureCount}
                  onChangeText={onStandardWinnerExposureCountChange}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.textInput(colors)}
                />
              </View>
              
              <View>
                <Label colors={colors} sub="Penalty per exposure (5-10 points)">Penalty Per Exposure</Label>
                <TextInput
                  keyboardType="number-pad"
                  value={exposurePenaltyPerExposure}
                  onChangeText={onExposurePenaltyPerExposureChange}
                  placeholder="5"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.textInput(colors)}
                />
              </View>
            </View>
          )}
        </View>

        {/* Doubles and Special Rules */}
        <RowWithEdit 
          colors={colors} 
          onEdit={() => onEditRule('lastTileFromWall', 'multiplier', 2)}
          editKey="lastTileFromWall"
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub="Last tile taken from wall">Last Tile from Wall</Label>
          </View>
          <Switch 
            value={lastTileFromWall} 
            onValueChange={onLastTileFromWallChange}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={lastTileFromWall ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>

        <RowWithEdit 
          colors={colors} 
          onEdit={() => onEditRule('lastTileClaim', 'multiplier', 2)}
          editKey="lastTileClaim"
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub="Last tile discarded in the game">Last Tile Claim</Label>
          </View>
          <Switch 
            value={lastTileClaim} 
            onValueChange={onLastTileClaimChange}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={lastTileClaim ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>

        <RowWithEdit 
          colors={colors} 
          onEdit={() => onEditRule('robbingTheJoker', 'multiplier', 2)}
          editKey="robbingTheJoker"
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub="Robbing a joker from a player's exposure for Mah Jongg">Robbing the Joker</Label>
          </View>
          <Switch 
            value={robbingTheJoker} 
            onValueChange={onRobbingTheJokerChange}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={robbingTheJoker ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>

        <RowWithEdit colors={colors} onEdit={undefined} editKey={null}>
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub="East pays or receives double">East's Double Payout</Label>
          </View>
          <Switch 
            value={eastDouble} 
            onValueChange={onEastDoubleChange}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={eastDouble ? colors.card : colors.textSecondary}
          />
          {/* Invisible placeholder to align with other toggles that have edit icons */}
          <View style={{ padding: 8, marginLeft: 8, width: 30 }}>
            <FontAwesome5 name="edit" size={14} color="transparent" />
          </View>
        </RowWithEdit>
        {eastDouble && (
          <View style={{ marginTop: 8 }}>
            <Row colors={colors}>
              <Label colors={colors} sub="Mark if you (the winner) are East">I Am East</Label>
              <Switch 
                value={isWinnerEast} 
                onValueChange={onIsWinnerEastChange}
                trackColor={{ false: colors.border, true: colors.gobutton }}
                thumbColor={isWinnerEast ? colors.card : colors.textSecondary}
              />
            </Row>
          </View>
        )}
      </View>

      {/* Custom Rules */}
      <CustomRulesSection
        customRules={customRules}
        selectedCustomRuleIds={selectedCustomRuleIds}
        theme={theme}
        onSelectedCustomRuleIdsChange={onSelectedCustomRuleIdsChange}
        onCustomRulesChange={onCustomRulesChange}
        onShowCustomRuleModal={onShowCustomRuleModal}
      />

      {/* Players */}
      <View style={{ marginTop: 8 }}>
        <Label colors={colors}>Players</Label>
        <Row style={{ justifyContent: "flex-start" }} colors={colors}>
          {[2, 3, 4].map((n) => (
            <Seg key={n} selected={numPlayers === n} onPress={() => onNumPlayersChange(n)} colors={colors} theme={theme}>
              {n}
            </Seg>
          ))}
        </Row>
      </View>
    </>
  );
}

