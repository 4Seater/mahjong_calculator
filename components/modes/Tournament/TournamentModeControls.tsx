import React from 'react';
import { View, Text, Switch } from 'react-native';
import { getColors } from '@/constants/colors';
import { styles } from '../../ScoreCalculatorCard.styles';
import { Row, Label, Seg } from '../../shared/CalculatorHelpers';
import type { WinType } from '@/lib/scoring/types';
import CustomRulesSection from '../../CustomRulesSection';
import type { CustomRule } from '@/lib/storage/customRulesStorage';

interface TournamentModeControlsProps {
  winType: WinType;
  selfPick: boolean;
  jokerless: boolean;
  tournamentWinnerId: string;
  tournamentDiscarderId: string;
  winnerExposureCount: 0 | 1 | 2 | 3 | 4;
  isWallGame: boolean;
  timeExpired: boolean;
  deadN: boolean;
  deadE: boolean;
  deadW: boolean;
  deadS: boolean;
  playerIds: string[];
  customRules: CustomRule[];
  selectedCustomRuleIds: Set<string>;
  theme: 'light' | 'dark';
  onWinTypeChange: (winType: WinType) => void;
  onSelfPickChange: (value: boolean) => void;
  onJokerlessChange: (value: boolean) => void;
  onTournamentWinnerIdChange: (id: string) => void;
  onTournamentDiscarderIdChange: (id: string) => void;
  onWinnerExposureCountChange: (count: 0 | 1 | 2 | 3 | 4) => void;
  onIsWallGameChange: (value: boolean) => void;
  onTimeExpiredChange: (value: boolean) => void;
  onDeadNChange: (value: boolean) => void;
  onDeadEChange: (value: boolean) => void;
  onDeadWChange: (value: boolean) => void;
  onDeadSChange: (value: boolean) => void;
  onSelectedCustomRuleIdsChange: (ids: Set<string>) => void;
  onCustomRulesChange: (rules: CustomRule[]) => void;
  onShowCustomRuleModal: () => void;
}

export default function TournamentModeControls({
  winType,
  selfPick,
  jokerless,
  tournamentWinnerId,
  tournamentDiscarderId,
  winnerExposureCount,
  isWallGame,
  timeExpired,
  deadN,
  deadE,
  deadW,
  deadS,
  playerIds,
  customRules,
  selectedCustomRuleIds,
  theme,
  onWinTypeChange,
  onSelfPickChange,
  onJokerlessChange,
  onTournamentWinnerIdChange,
  onTournamentDiscarderIdChange,
  onWinnerExposureCountChange,
  onIsWallGameChange,
  onTimeExpiredChange,
  onDeadNChange,
  onDeadEChange,
  onDeadWChange,
  onDeadSChange,
  onSelectedCustomRuleIdsChange,
  onCustomRulesChange,
  onShowCustomRuleModal,
}: TournamentModeControlsProps) {
  const colors = getColors(theme);

  return (
    <>
      {/* Win Type for Tournament */}
      <View style={{ marginTop: 4, opacity: isWallGame ? 0.5 : 1 }}>
        <Label colors={colors}>Win Type</Label>
        <Row style={{ justifyContent: "flex-start" }} colors={colors}>
          <Seg selected={winType === "self_pick"} onPress={() => !isWallGame && onWinTypeChange("self_pick")} colors={colors} theme={theme} disabled={isWallGame}>Self-Pick</Seg>
          <Seg selected={winType === "discard"} onPress={() => !isWallGame && onWinTypeChange("discard")} colors={colors} theme={theme} disabled={isWallGame}>From Discard</Seg>
        </Row>
      </View>

      {/* Tournament-specific toggles */}
      <Row colors={colors} style={{ opacity: isWallGame ? 0.5 : 1 }}>
        <Label colors={colors}>Self-Pick Bonus (+10)</Label>
        <Switch 
          value={selfPick} 
          onValueChange={isWallGame ? undefined : onSelfPickChange}
          disabled={isWallGame}
          trackColor={{ false: colors.border, true: colors.gobutton }}
          thumbColor={selfPick ? colors.card : colors.textSecondary}
        />
      </Row>
      <Row colors={colors} style={{ opacity: isWallGame ? 0.5 : 1 }}>
        <Label colors={colors} sub="No jokers anywhere.">Jokerless (+20)</Label>
        <Switch 
          value={jokerless} 
          onValueChange={isWallGame ? undefined : onJokerlessChange}
          disabled={isWallGame}
          trackColor={{ false: colors.border, true: colors.gobutton }}
          thumbColor={jokerless ? colors.card : colors.textSecondary}
        />
      </Row>

      {/* Winner & discarder selection */}
      <View style={{ marginTop: 8, opacity: isWallGame ? 0.5 : 1 }}>
        <Label colors={colors}>Winner</Label>
        <Row style={{ justifyContent: "flex-start" }} colors={colors}>
          {playerIds.map(id => (
            <Seg key={id} selected={tournamentWinnerId === id} onPress={() => !isWallGame && onTournamentWinnerIdChange(id)} colors={colors} theme={theme} disabled={isWallGame}>{id}</Seg>
          ))}
        </Row>
      </View>

      {winType === "discard" && (
        <View style={{ marginTop: 8, opacity: isWallGame ? 0.5 : 1 }}>
          <Label colors={colors}>Discarder</Label>
          <Row style={{ justifyContent: "flex-start" }} colors={colors}>
            {playerIds.filter(id => id !== tournamentWinnerId).map(id => (
              <Seg key={id} selected={tournamentDiscarderId === id} onPress={() => !isWallGame && onTournamentDiscarderIdChange(id)} colors={colors} theme={theme} disabled={isWallGame}>{id}</Seg>
            ))}
          </Row>
        </View>
      )}

      <View style={{ marginTop: 8, opacity: isWallGame ? 0.5 : 1 }}>
        <Label colors={colors} sub="Winner's exposures at time of win determine discarder penalty (0–1 => -10; 2+ => -20).">
          Winner Exposure Count
        </Label>
        <Row style={{ justifyContent: "flex-start" }} colors={colors}>
          {[0,1,2,3,4].map(n => (
            <Seg key={n} selected={winnerExposureCount === n} onPress={() => !isWallGame && onWinnerExposureCountChange(n as 0|1|2|3|4)} colors={colors} theme={theme} disabled={isWallGame}>
              {n}
            </Seg>
          ))}
        </Row>
      </View>

      {/* Time-expired */}
      <Row colors={colors} style={{ opacity: isWallGame ? 0.5 : 1 }}>
        <Label colors={colors}>Time Expired (everyone 0)</Label>
        <Switch 
          value={timeExpired} 
          onValueChange={isWallGame ? undefined : onTimeExpiredChange}
          disabled={isWallGame}
          trackColor={{ false: colors.border, true: colors.gobutton }}
          thumbColor={timeExpired ? colors.card : colors.textSecondary}
        />
      </Row>

      {/* Dead hands (no wall bonus) - Always enabled, even when wall game is selected */}
      <View style={{ marginTop: 8 }}>
        <Label colors={colors}>Mark Dead Hands (no +10 on Wall)</Label>
        <Row colors={colors}><Text style={styles.labelText(colors)}>N dead</Text><Switch 
          value={deadN} 
          onValueChange={onDeadNChange}
          trackColor={{ false: colors.border, true: colors.gobutton }}
          thumbColor={deadN ? colors.card : colors.textSecondary}
        /></Row>
        <Row colors={colors}><Text style={styles.labelText(colors)}>E dead</Text><Switch 
          value={deadE} 
          onValueChange={onDeadEChange}
          trackColor={{ false: colors.border, true: colors.gobutton }}
          thumbColor={deadE ? colors.card : colors.textSecondary}
        /></Row>
        <Row colors={colors}><Text style={styles.labelText(colors)}>W dead</Text><Switch 
          value={deadW} 
          onValueChange={onDeadWChange}
          trackColor={{ false: colors.border, true: colors.gobutton }}
          thumbColor={deadW ? colors.card : colors.textSecondary}
        /></Row>
        <Row colors={colors}><Text style={styles.labelText(colors)}>S dead</Text><Switch 
          value={deadS} 
          onValueChange={onDeadSChange}
          trackColor={{ false: colors.border, true: colors.gobutton }}
          thumbColor={deadS ? colors.card : colors.textSecondary}
        /></Row>
      </View>

      {/* Custom Rules */}
      <View style={{ opacity: isWallGame ? 0.5 : 1 }}>
        <CustomRulesSection
          customRules={customRules}
          selectedCustomRuleIds={selectedCustomRuleIds}
          theme={theme}
          onSelectedCustomRuleIdsChange={isWallGame ? () => {} : onSelectedCustomRuleIdsChange}
          onCustomRulesChange={onCustomRulesChange}
          onShowCustomRuleModal={isWallGame ? () => {} : onShowCustomRuleModal}
        />
      </View>
    </>
  );
}

