import React from 'react';
import { View, Text, Switch } from 'react-native';
import { getColors } from '@/constants/colors';
import { styles } from '../../ScoreCalculatorCard.styles';
import { Row, Label, Seg } from '../../shared/CalculatorHelpers';
import type { WinType, TournamentGameResult } from '@/lib/scoring/types';

interface TournamentModeControlsProps {
  winType: WinType;
  jokerless: boolean;
  tournamentWinnerId: string;
  tournamentDiscarderId: string;
  winnerExposureCount: 0 | 1 | 2 | 3 | 4;
  isWallGame: boolean;
  tournamentGameResult: TournamentGameResult;
  falseMahjongIntactPlayerId: string;
  deadN: boolean;
  deadE: boolean;
  deadW: boolean;
  deadS: boolean;
  playerIds: string[];
  theme: 'light' | 'dark';
  onWinTypeChange: (winType: WinType) => void;
  onJokerlessChange: (value: boolean) => void;
  onTournamentWinnerIdChange: (id: string) => void;
  onTournamentDiscarderIdChange: (id: string) => void;
  onWinnerExposureCountChange: (count: 0 | 1 | 2 | 3 | 4) => void;
  onTournamentGameResultChange: (result: TournamentGameResult) => void;
  onFalseMahjongIntactPlayerIdChange: (id: string) => void;
  onDeadNChange: (value: boolean) => void;
  onDeadEChange: (value: boolean) => void;
  onDeadWChange: (value: boolean) => void;
  onDeadSChange: (value: boolean) => void;
}

function FalseMahjongOutcomeSelector({
  tournamentGameResult,
  colors,
  theme,
  onTournamentGameResultChange,
}: {
  tournamentGameResult: TournamentGameResult;
  colors: ReturnType<typeof getColors>;
  theme: 'light' | 'dark';
  onTournamentGameResultChange: (result: TournamentGameResult) => void;
}) {
  return (
    <View style={{ marginTop: 8 }}>
      <Label colors={colors} sub="Choose the false-call outcome">
        False Mah Jongg Outcome
      </Label>
      <Row style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }} colors={colors}>
        <Seg
          selected={tournamentGameResult === 'false_mj_all_exposed'}
          onPress={() => onTournamentGameResultChange('false_mj_all_exposed')}
          colors={colors}
          theme={theme}
        >
          3 others exposed (all 0)
        </Seg>
        <Seg
          selected={tournamentGameResult === 'false_mj_one_intact'}
          onPress={() => onTournamentGameResultChange('false_mj_one_intact')}
          colors={colors}
          theme={theme}
        >
          1 intact (+10)
        </Seg>
        <Seg
          selected={tournamentGameResult === 'false_mj_game_continues'}
          onPress={() => onTournamentGameResultChange('false_mj_game_continues')}
          colors={colors}
          theme={theme}
        >
          2+ intact (continue)
        </Seg>
      </Row>
    </View>
  );
}

function TournamentPenaltiesReference({ colors }: { colors: ReturnType<typeof getColors> }) {
  return (
    <View
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
      }}
    >
      <Text style={[styles.labelText(colors), { fontWeight: '700', marginBottom: 8 }]}>
        Bonuses & Penalties Reference
      </Text>
      <Text style={[styles.labelSubtext(colors), { marginBottom: 6 }]}>
        • Self-pick: winner +10
      </Text>
      <Text style={[styles.labelSubtext(colors), { marginBottom: 6 }]}>
        • Jokerless hand: winner +20
      </Text>
      <Text style={[styles.labelSubtext(colors), { marginBottom: 6 }]}>
        • Discarder −10 when winner has no exposures (0–1 exposure)
      </Text>
      <Text style={[styles.labelSubtext(colors), { marginBottom: 6 }]}>
        • Discarder −20 when winner has 2 or more exposures
      </Text>
      <Text style={[styles.labelSubtext(colors), { marginBottom: 6 }]}>
        • False Mah Jongg — all 3 others expose: everyone gets 0
      </Text>
      <Text style={[styles.labelSubtext(colors), { marginBottom: 6 }]}>
        • False Mah Jongg — only 1 hand intact: that player +10, others 0
      </Text>
      <Text style={[styles.labelSubtext(colors)]}>
        • False Mah Jongg — 2+ hands intact: game continues (no score change)
      </Text>
    </View>
  );
}

export default function TournamentModeControls({
  winType,
  jokerless,
  tournamentWinnerId,
  tournamentDiscarderId,
  winnerExposureCount,
  isWallGame,
  tournamentGameResult,
  falseMahjongIntactPlayerId,
  deadN,
  deadE,
  deadW,
  deadS,
  playerIds,
  theme,
  onWinTypeChange,
  onJokerlessChange,
  onTournamentWinnerIdChange,
  onTournamentDiscarderIdChange,
  onWinnerExposureCountChange,
  onTournamentGameResultChange,
  onFalseMahjongIntactPlayerIdChange,
  onDeadNChange,
  onDeadEChange,
  onDeadWChange,
  onDeadSChange,
}: TournamentModeControlsProps) {
  const colors = getColors(theme);
  const disabled = isWallGame;
  const isFalseMj =
    tournamentGameResult === 'false_mj_all_exposed' ||
    tournamentGameResult === 'false_mj_one_intact' ||
    tournamentGameResult === 'false_mj_game_continues';
  const showValidWin = tournamentGameResult === 'valid_win' && !isWallGame;

  return (
    <>
      <View style={{ marginTop: 4, opacity: disabled ? 0.5 : 1 }}>
        <Label colors={colors} sub="What happened this hand?">
          Game Result
        </Label>
        <Row style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }} colors={colors}>
          <Seg
            selected={tournamentGameResult === 'valid_win'}
            onPress={() => !disabled && onTournamentGameResultChange('valid_win')}
            colors={colors}
            theme={theme}
            disabled={disabled}
          >
            Mah Jongg Win
          </Seg>
          <Seg
            selected={isFalseMj}
            onPress={() => !disabled && onTournamentGameResultChange('false_mj_all_exposed')}
            colors={colors}
            theme={theme}
            disabled={disabled}
          >
            False Mah Jongg
          </Seg>
          <Seg
            selected={tournamentGameResult === 'time_expired'}
            onPress={() => !disabled && onTournamentGameResultChange('time_expired')}
            colors={colors}
            theme={theme}
            disabled={disabled}
          >
            Time Expired
          </Seg>
        </Row>
      </View>

      {isFalseMj && !isWallGame && (
        <>
          <FalseMahjongOutcomeSelector
            tournamentGameResult={tournamentGameResult}
            colors={colors}
            theme={theme}
            onTournamentGameResultChange={onTournamentGameResultChange}
          />
          {tournamentGameResult === 'false_mj_all_exposed' && (
            <Text style={[styles.labelSubtext(colors), { marginTop: 4, fontStyle: 'italic' }]}>
              All three other players exposed — everyone scores 0.
            </Text>
          )}
          {tournamentGameResult === 'false_mj_one_intact' && (
            <View style={{ marginTop: 8 }}>
              <Label colors={colors}>Player with intact hand (+10)</Label>
              <Row style={{ justifyContent: 'flex-start' }} colors={colors}>
                {playerIds.map((id) => (
                  <Seg
                    key={id}
                    selected={falseMahjongIntactPlayerId === id}
                    onPress={() => onFalseMahjongIntactPlayerIdChange(id)}
                    colors={colors}
                    theme={theme}
                  >
                    {id}
                  </Seg>
                ))}
              </Row>
            </View>
          )}
          {tournamentGameResult === 'false_mj_game_continues' && (
            <Text style={[styles.labelSubtext(colors), { marginTop: 4, fontStyle: 'italic' }]}>
              2 or more hands intact — game continues with no score changes.
            </Text>
          )}
        </>
      )}

      {tournamentGameResult === 'time_expired' && !isWallGame && (
        <Text style={[styles.labelSubtext(colors), { marginTop: 4, fontStyle: 'italic' }]}>
          Time expired — all players score 0.
        </Text>
      )}

      {showValidWin && (
        <>
          <View style={{ marginTop: 8 }}>
            <Label colors={colors} sub="Self-pick adds +10 automatically">
              Win Type
            </Label>
            <Row style={{ justifyContent: 'flex-start' }} colors={colors}>
              <Seg
                selected={winType === 'self_pick'}
                onPress={() => onWinTypeChange('self_pick')}
                colors={colors}
                theme={theme}
              >
                Self-Pick (+10)
              </Seg>
              <Seg
                selected={winType === 'discard'}
                onPress={() => onWinTypeChange('discard')}
                colors={colors}
                theme={theme}
              >
                From Discard
              </Seg>
            </Row>
          </View>

          <Row colors={colors}>
            <Label colors={colors} sub="No jokers in the winning hand">
              Jokerless (+20)
            </Label>
            <Switch
              value={jokerless}
              onValueChange={onJokerlessChange}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={jokerless ? colors.card : colors.textSecondary}
            />
          </Row>

          <View style={{ marginTop: 8 }}>
            <Label colors={colors}>Winner</Label>
            <Row style={{ justifyContent: 'flex-start' }} colors={colors}>
              {playerIds.map((id) => (
                <Seg
                  key={id}
                  selected={tournamentWinnerId === id}
                  onPress={() => onTournamentWinnerIdChange(id)}
                  colors={colors}
                  theme={theme}
                >
                  {id}
                </Seg>
              ))}
            </Row>
          </View>

          {winType === 'discard' && (
            <>
              <View style={{ marginTop: 8 }}>
                <Label colors={colors} sub="Player who threw the winning tile">
                  Discarder
                </Label>
                <Row style={{ justifyContent: 'flex-start' }} colors={colors}>
                  {playerIds
                    .filter((id) => id !== tournamentWinnerId)
                    .map((id) => (
                      <Seg
                        key={id}
                        selected={tournamentDiscarderId === id}
                        onPress={() => onTournamentDiscarderIdChange(id)}
                        colors={colors}
                        theme={theme}
                      >
                        {id}
                      </Seg>
                    ))}
                </Row>
              </View>

              <View style={{ marginTop: 8 }}>
                <Label
                  colors={colors}
                  sub="0–1 exposure → discarder −10; 2+ exposures → discarder −20"
                >
                  Winner Exposure Count
                </Label>
                <Row style={{ justifyContent: 'flex-start' }} colors={colors}>
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Seg
                      key={n}
                      selected={winnerExposureCount === n}
                      onPress={() => onWinnerExposureCountChange(n as 0 | 1 | 2 | 3 | 4)}
                      colors={colors}
                      theme={theme}
                    >
                      {n}
                    </Seg>
                  ))}
                </Row>
              </View>
            </>
          )}
        </>
      )}

      <TournamentPenaltiesReference colors={colors} />

      <View style={{ marginTop: 12 }}>
        <Label colors={colors} sub="Dead players do not receive +10 on a wall game">
          Mark Dead Hands
        </Label>
        <Row colors={colors}>
          <Text style={styles.labelText(colors)}>N dead</Text>
          <Switch
            value={deadN}
            onValueChange={onDeadNChange}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={deadN ? colors.card : colors.textSecondary}
          />
        </Row>
        <Row colors={colors}>
          <Text style={styles.labelText(colors)}>E dead</Text>
          <Switch
            value={deadE}
            onValueChange={onDeadEChange}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={deadE ? colors.card : colors.textSecondary}
          />
        </Row>
        <Row colors={colors}>
          <Text style={styles.labelText(colors)}>W dead</Text>
          <Switch
            value={deadW}
            onValueChange={onDeadWChange}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={deadW ? colors.card : colors.textSecondary}
          />
        </Row>
        <Row colors={colors}>
          <Text style={styles.labelText(colors)}>S dead</Text>
          <Switch
            value={deadS}
            onValueChange={onDeadSChange}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={deadS ? colors.card : colors.textSecondary}
          />
        </Row>
      </View>
    </>
  );
}
