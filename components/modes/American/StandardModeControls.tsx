import React from 'react';
import { View, Text, TextInput, Switch } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from '../../ScoreCalculatorCard.styles';
import { Row, Label, Seg, RowWithEdit } from '../../shared/CalculatorHelpers';
import type { WinType } from '@/lib/scoring/types';
import CustomRulesSection from '../../CustomRulesSection';
import type { CustomRule } from '@/lib/storage/customRulesStorage';

interface StandardModeControlsProps {
  wallGame: boolean;
  winType: WinType;
  jokerless: boolean;
  misnamedJoker: boolean;
  heavenlyHand: boolean;
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
  onHeavenlyHandChange: (value: boolean) => void;
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
  wallGame,
  winType,
  jokerless,
  misnamedJoker,
  heavenlyHand,
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
  onHeavenlyHandChange,
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
      <View style={{ marginTop: 4, opacity: wallGame ? 0.5 : 1 }}>
        <Label colors={colors}>Win Type</Label>
        <Row style={{ justifyContent: "flex-start" }} colors={colors}>
          <Seg selected={winType === "self_pick"} onPress={() => !wallGame && onWinTypeChange("self_pick")} colors={colors} theme={theme} disabled={wallGame}>Self-Pick</Seg>
          <Seg selected={winType === "discard"} onPress={() => !wallGame && onWinTypeChange("discard")} colors={colors} theme={theme} disabled={wallGame}>From Discard</Seg>
        </Row>
      </View>

      {/* Standard Rules */}
      <View style={{ marginTop: 8, paddingTop: 8, borderTopColor: colors.border, borderTopWidth: 1, opacity: wallGame ? 0.5 : 1 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Label colors={colors}>Standard NMJL Rules</Label>
        </View>
        
        {/* Jokerless */}
        <RowWithEdit 
          colors={colors} 
          onEdit={() => onEditRule('jokerless', 'multiplier', 2)}
          editKey="jokerless"
          disabled={wallGame}
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub={`No jokers anywhere in the hand (${customRuleValues.jokerless?.type === 'points' ? '+' : '×'}${customRuleValues.jokerless?.value || 2}).`}>
              Jokerless
            </Label>
          </View>
          <Switch 
            value={jokerless} 
            onValueChange={wallGame ? undefined : onJokerlessChange}
            disabled={wallGame}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={jokerless ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>

        {/* Mis-named Joker */}
        <RowWithEdit 
          colors={colors} 
          onEdit={() => onEditRule('misnamedJoker', 'multiplier', 4)}
          editKey="misnamedJoker"
          disabled={wallGame}
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub={`If a joker is discarded and mis-named, it may be called for mahjong. The multiplier is ${customRuleValues.misnamedJoker?.value || 4}× to the discarder.`}>
              Mis-named Joker
            </Label>
          </View>
          <Switch 
            value={misnamedJoker} 
            onValueChange={wallGame ? undefined : onMisnamedJokerChange}
            disabled={wallGame}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={misnamedJoker ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>

        {/* Heavenly Hand */}
        <RowWithEdit 
          colors={colors} 
          onEdit={undefined}
          editKey={null}
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub="Wins by East before or right after the Charleston are considered self-picked. Winner receives 2× payout from all players.">
              Heavenly Hand
            </Label>
          </View>
          <Switch 
            value={heavenlyHand} 
            onValueChange={wallGame ? undefined : onHeavenlyHandChange}
            disabled={wallGame}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={heavenlyHand ? colors.card : colors.textSecondary}
          />
          {/* Invisible placeholder to align with other toggles */}
          <View style={{ padding: 8, marginLeft: 8, width: 30 }}>
            <FontAwesome5 name="edit" size={14} color="transparent" />
          </View>
        </RowWithEdit>
      </View>

      {/* Optional House Rules */}
      <View style={{ marginTop: 8, paddingTop: 8, borderTopColor: colors.border, borderTopWidth: 1, opacity: wallGame ? 0.5 : 1 }}>
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Label colors={colors}>Optional House Rules</Label>
        </View>

        {/* No Exposures */}
        <View style={{ marginTop: 8 }}>
        <RowWithEdit 
          colors={colors} 
          onEdit={() => onEditRule('noExposures', 'multiplier', 2)}
          editKey="noExposures"
          disabled={wallGame}
        >
            <View style={{ flex: 1 }}>
              <Label colors={colors} sub="Award for a fully concealed win">
                No Exposures (Fully Concealed)
              </Label>
            </View>
            <Switch 
              value={noExposures} 
              onValueChange={wallGame ? undefined : onNoExposuresChange}
              disabled={wallGame}
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
              onValueChange={wallGame ? undefined : onExposurePenaltyEnabledChange}
              disabled={wallGame || noExposures}
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
                  onChangeText={wallGame ? undefined : onStandardWinnerExposureCountChange}
                  editable={!wallGame}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.textInput(colors), wallGame && { opacity: 0.5 }]}
                />
              </View>
              
              <View>
                <Label colors={colors} sub="Penalty per exposure (5-10 points)">Penalty Per Exposure</Label>
                <TextInput
                  keyboardType="number-pad"
                  value={exposurePenaltyPerExposure}
                  onChangeText={wallGame ? undefined : onExposurePenaltyPerExposureChange}
                  editable={!wallGame}
                  placeholder="5"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.textInput(colors), wallGame && { opacity: 0.5 }]}
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
          disabled={wallGame}
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub="Last tile taken from wall">Last Tile from Wall</Label>
          </View>
          <Switch 
            value={lastTileFromWall} 
            onValueChange={wallGame ? undefined : onLastTileFromWallChange}
            disabled={wallGame}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={lastTileFromWall ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>

        <RowWithEdit 
          colors={colors} 
          onEdit={() => onEditRule('lastTileClaim', 'multiplier', 2)}
          editKey="lastTileClaim"
          disabled={wallGame}
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub="Last tile discarded in the game">Last Tile Claim</Label>
          </View>
          <Switch 
            value={lastTileClaim} 
            onValueChange={wallGame ? undefined : onLastTileClaimChange}
            disabled={wallGame}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={lastTileClaim ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>

        <RowWithEdit 
          colors={colors} 
          onEdit={() => onEditRule('robbingTheJoker', 'multiplier', 2)}
          editKey="robbingTheJoker"
          disabled={wallGame}
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub="Robbing a joker from a player's exposure for Mah Jongg">Robbing the Joker</Label>
          </View>
          <Switch 
            value={robbingTheJoker} 
            onValueChange={wallGame ? undefined : onRobbingTheJokerChange}
            disabled={wallGame}
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
            onValueChange={wallGame ? undefined : onEastDoubleChange}
            disabled={wallGame}
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
                onValueChange={wallGame ? undefined : onIsWinnerEastChange}
                disabled={wallGame}
                trackColor={{ false: colors.border, true: colors.gobutton }}
                thumbColor={isWinnerEast ? colors.card : colors.textSecondary}
              />
            </Row>
          </View>
        )}
      </View>

      {/* Custom Rules */}
      <View style={{ opacity: wallGame ? 0.5 : 1 }}>
        <CustomRulesSection
          customRules={customRules}
          selectedCustomRuleIds={selectedCustomRuleIds}
          theme={theme}
          onSelectedCustomRuleIdsChange={wallGame ? () => {} : onSelectedCustomRuleIdsChange}
          onCustomRulesChange={onCustomRulesChange}
          onShowCustomRuleModal={wallGame ? () => {} : onShowCustomRuleModal}
        />
      </View>

      {/* Players */}
      <View style={{ marginTop: 8, opacity: wallGame ? 0.5 : 1 }}>
        <Label colors={colors}>Players</Label>
        <Row style={{ justifyContent: "flex-start" }} colors={colors}>
          {[2, 3, 4].map((n) => (
            <Seg key={n} selected={numPlayers === n} onPress={() => !wallGame && onNumPlayersChange(n)} colors={colors} theme={theme} disabled={wallGame}>
              {n}
            </Seg>
          ))}
        </Row>
      </View>
    </>
  );
}

