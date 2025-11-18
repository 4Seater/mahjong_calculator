import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { computeNmjlStandard, computeTournament } from "@/lib/scoring/engine";
import type { WinType, NoExposureBonusConfig } from "@/lib/scoring/types";
import colors from "@/constants/colors";
import { FontAwesome5 } from '@expo/vector-icons';

/** Small UI helpers */
function Row({ children, style }: any) {
  return <View style={[styles.row, style]}>{children}</View>;
}
function Label({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>{children}</Text>
      {sub ? <Text style={styles.labelSubtext}>{sub}</Text> : null}
    </View>
  );
}
function Seg({ selected, onPress, children }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.segButton,
        selected ? styles.segButtonSelected : styles.segButtonUnselected
      ]}
    >
      <Text style={[
        styles.segText,
        selected ? styles.segTextSelected : styles.segTextUnselected
      ]}>{children}</Text>
    </TouchableOpacity>
  );
}

type Mode = "standard" | "tournament";

type Props = {
  // Optional: wire actual player IDs if you want the payerMap to label real people.
  winnerId?: string;
  discarderId?: string;
  otherPlayerIds?: string[];
  defaultNumPlayers?: number; // default 4
  onComputed?: (v: ReturnType<typeof computeNmjlStandard>) => void;
  onClose?: () => void;
};

export default function ScoreCalculatorCard({
  winnerId,
  discarderId,
  otherPlayerIds,
  defaultNumPlayers = 4,
  onComputed,
  onClose
}: Props) {
  // Mode selection
  const [mode, setMode] = useState<Mode>("standard");

  // Inputs
  const [basePoints, setBasePoints] = useState<string>("25");
  const [winType, setWinType] = useState<WinType>("self_pick");
  const [jokerless, setJokerless] = useState(false);
  const [singlesAndPairs, setSinglesAndPairs] = useState(false);
  const [misnamedJoker, setMisnamedJoker] = useState(false);

  // Tournament-specific inputs
  const [playerIds] = useState(["N", "E", "W", "S"]);
  const [tournamentWinnerId, setTournamentWinnerId] = useState<string>("N");
  const [tournamentDiscarderId, setTournamentDiscarderId] = useState<string>("W");
  const [selfPick, setSelfPick] = useState(true);
  const [winnerExposureCount, setWinnerExposureCount] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [isWallGame, setIsWallGame] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [deadN, setDeadN] = useState(false);
  const [deadE, setDeadE] = useState(false);
  const [deadW, setDeadW] = useState(false);
  const [deadS, setDeadS] = useState(false);

  // No-Exposures bonus controls
  const [noExposures, setNoExposures] = useState(false);
  const [noExpMode, setNoExpMode] = useState<NoExposureBonusConfig["mode"]>("flat"); // "flat" | "multiplier"
  const [noExpValue, setNoExpValue] = useState<string>("10"); // default +10 pts
  const [suppressOnConcealedOnly, setSuppressOnConcealedOnly] = useState(true);
  const [isCardHandConcealedOnly, setIsCardHandConcealedOnly] = useState(false);

  // Table size
  const [numPlayers, setNumPlayers] = useState<number>(defaultNumPlayers);

  // Build config object for bonus (or omit it entirely if not enabled)
  const noExposureBonus =
    noExposures
      ? ({
          mode: noExpMode,
          value: Number(noExpValue || 0),
          suppressOnConcealedOnly
        } as NoExposureBonusConfig)
      : undefined;

  const result = useMemo(() => {
    return computeNmjlStandard({
      basePoints: Number(basePoints || 0),
      winType,
      jokerless,
      singlesAndPairs,
      numPlayers,
      noExposures,
      noExposureBonus,
      isCardHandConcealedOnly,
      misnamedJoker,
      winnerId,
      discarderId,
      otherPlayerIds
    });
  }, [
    basePoints,
    winType,
    jokerless,
    singlesAndPairs,
    numPlayers,
    noExposures,
    noExpMode,
    noExpValue,
    suppressOnConcealedOnly,
    isCardHandConcealedOnly,
    misnamedJoker,
    winnerId,
    discarderId,
    otherPlayerIds
  ]);

  // Tournament result calculation
  const tournamentResult = useMemo(() => {
    if (mode !== "tournament") return null;
    const dead = [
      deadN ? "N" : null,
      deadE ? "E" : null,
      deadW ? "W" : null,
      deadS ? "S" : null,
    ].filter(Boolean) as string[];

    return computeTournament({
      basePoints: Number(basePoints || 0),
      winType: isWallGame || timeExpired ? undefined : winType,
      winnerId: isWallGame || timeExpired ? undefined : tournamentWinnerId,
      discarderId: winType === "discard" ? tournamentDiscarderId : null,
      playerIds,
      selfPick,
      jokerless,
      singlesAndPairs,
      winnerExposureCount,
      isWallGame,
      timeExpiredNoScore: timeExpired,
      deadPlayerIds: dead,
    });
  }, [
    mode, basePoints, winType, tournamentWinnerId, tournamentDiscarderId,
    selfPick, jokerless, singlesAndPairs, winnerExposureCount,
    isWallGame, timeExpired, deadN, deadE, deadW, deadS
  ]);

  useEffect(() => {
    onComputed?.(result);
  }, [result, onComputed]);


  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.header}>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color={colors.card} />
            </TouchableOpacity>
          )}
          <View style={styles.headerContent}>
            <Image 
              source={require('@/assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Score Calculator</Text>
          </View>
        </View>

        {/* Mode Selection */}
        <View style={styles.section}>
          <Label>Calculator Mode</Label>
          <Row style={{ justifyContent: "flex-start" }}>
            <Seg selected={mode === "standard"} onPress={() => setMode("standard")}>Standard</Seg>
            <Seg selected={mode === "tournament"} onPress={() => setMode("tournament")}>Tournament</Seg>
          </Row>
        </View>

        {/* Base points */}
        <View>
          <Label sub="Type the printed value from your NMJL card (points or cents).">Base Points</Label>
          <TextInput
            keyboardType="number-pad"
            value={basePoints}
            onChangeText={setBasePoints}
            placeholder="e.g., 25"
            placeholderTextColor={colors.textSecondary}
            style={styles.textInput}
          />
        </View>

        {/* Standard Mode Controls */}
        {mode === "standard" && (
          <>

      {/* Win Type */}
      <View style={{ marginTop: 4 }}>
        <Label>Win Type</Label>
        <Row style={{ justifyContent: "flex-start" }}>
          <Seg selected={winType === "self_pick"} onPress={() => setWinType("self_pick")}>Self-Pick</Seg>
          <Seg selected={winType === "discard"} onPress={() => setWinType("discard")}>From Discard</Seg>
        </Row>
      </View>

      {/* No-Exposures Bonus */}
      <View style={{ marginTop: 8, paddingTop: 8, borderTopColor: "#eee", borderTopWidth: 1 }}>
        <Row>
          <Label sub="Award for a fully concealed win (alternate/tournament rule).">No Exposures (Fully Concealed)</Label>
          <Switch 
            value={noExposures} 
            onValueChange={setNoExposures}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={noExposures ? colors.card : colors.textSecondary}
          />
        </Row>

        {/* Jokerless */}
        <Row>
          <Label sub="No jokers anywhere in the hand.">Jokerless</Label>
          <Switch 
            value={jokerless} 
            onValueChange={setJokerless}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={jokerless ? colors.card : colors.textSecondary}
          />
        </Row>

        {noExposures && (
          <>
            <Label sub="Choose whether the bonus is a flat add or a multiplier applied to each payer.">Bonus Type</Label>
            <Row style={{ justifyContent: "flex-start" }}>
              <Seg selected={noExpMode === "flat"} onPress={() => setNoExpMode("flat")}>Flat (+)</Seg>
              <Seg selected={noExpMode === "multiplier"} onPress={() => setNoExpMode("multiplier")}>Multiplier (×)</Seg>
            </Row>

            <View style={{ marginTop: 6 }}>
              <Label>{noExpMode === "flat" ? "Flat Bonus Amount" : "Multiplier Value"}</Label>
              <TextInput
                keyboardType="decimal-pad"
                value={noExpValue}
                onChangeText={setNoExpValue}
                placeholder={noExpMode === "flat" ? "e.g., 10" : "e.g., 2"}
                style={{ borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, marginTop: 6 }}
              />
            </View>

            <Row>
              <Label sub="If the card line is already Concealed Only, skip this bonus.">Suppress on "Concealed Only" Hands</Label>
              <Switch 
                value={suppressOnConcealedOnly} 
                onValueChange={setSuppressOnConcealedOnly}
                trackColor={{ false: colors.border, true: colors.gobutton }}
                thumbColor={suppressOnConcealedOnly ? colors.card : colors.textSecondary}
              />
            </Row>

            <Row>
              <Label sub="Toggle this ON when scoring a hand printed as Concealed Only on the card.">This Hand is "Concealed Only" on Card</Label>
              <Switch 
                value={isCardHandConcealedOnly} 
                onValueChange={setIsCardHandConcealedOnly}
                trackColor={{ false: colors.border, true: colors.gobutton }}
                thumbColor={isCardHandConcealedOnly ? colors.card : colors.textSecondary}
              />
            </Row>
          </>
        )}
      </View>

      {/* Misnamed Joker - only show for discard wins */}
      {winType === "discard" && (
        <View style={{ marginTop: 8, paddingTop: 8, borderTopColor: "#eee", borderTopWidth: 1 }}>
          <Row>
            <Label sub="The player who discarded pays 4× base, others pay nothing.">Misnamed Joker</Label>
            <Switch 
              value={misnamedJoker} 
              onValueChange={setMisnamedJoker}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={misnamedJoker ? colors.card : colors.textSecondary}
            />
          </Row>
        </View>
      )}

          {/* Players */}
          <View style={{ marginTop: 8 }}>
            <Label>Players</Label>
            <Row style={{ justifyContent: "flex-start" }}>
              {[2, 3, 4].map((n) => (
                <Seg key={n} selected={numPlayers === n} onPress={() => setNumPlayers(n)}>
                  {n}
                </Seg>
              ))}
            </Row>
          </View>
        </>
      )}

      {/* Tournament Mode Controls */}
      {mode === "tournament" && (
        <>
          {/* Win Type for Tournament */}
          <View style={{ marginTop: 4 }}>
            <Label>Win Type</Label>
            <Row style={{ justifyContent: "flex-start" }}>
              <Seg selected={winType === "self_pick"} onPress={() => setWinType("self_pick")}>Self-Pick</Seg>
              <Seg selected={winType === "discard"} onPress={() => setWinType("discard")}>From Discard</Seg>
            </Row>
          </View>

          {/* Tournament-specific toggles */}
          <Row>
            <Label>Self-Pick Bonus (+10)</Label>
            <Switch 
              value={selfPick} 
              onValueChange={setSelfPick}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={selfPick ? colors.card : colors.textSecondary}
            />
          </Row>
          <Row>
            <Label sub="No jokers anywhere.">Jokerless (+20)</Label>
            <Switch 
              value={jokerless} 
              onValueChange={setJokerless}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={jokerless ? colors.card : colors.textSecondary}
            />
          </Row>

          {/* Winner & discarder selection */}
          <View style={{ marginTop: 8 }}>
            <Label>Winner</Label>
            <Row style={{ justifyContent: "flex-start" }}>
              {playerIds.map(id => (
                <Seg key={id} selected={tournamentWinnerId === id} onPress={() => setTournamentWinnerId(id)}>{id}</Seg>
              ))}
            </Row>
          </View>

          {winType === "discard" && (
            <View style={{ marginTop: 8 }}>
              <Label>Discarder</Label>
              <Row style={{ justifyContent: "flex-start" }}>
                {playerIds.filter(id => id !== tournamentWinnerId).map(id => (
                  <Seg key={id} selected={tournamentDiscarderId === id} onPress={() => setTournamentDiscarderId(id)}>{id}</Seg>
                ))}
              </Row>
            </View>
          )}

          <View style={{ marginTop: 8 }}>
            <Label sub="Winner's exposures at time of win determine discarder penalty (0–1 => -10; 2+ => -20).">
              Winner Exposure Count
            </Label>
            <Row style={{ justifyContent: "flex-start" }}>
              {[0,1,2,3,4].map(n => (
                <Seg key={n} selected={winnerExposureCount === n} onPress={() => setWinnerExposureCount(n as 0|1|2|3|4)}>
                  {n}
                </Seg>
              ))}
            </Row>
          </View>

          {/* Wall / Time-expired */}
          <Row>
            <Label>Wall Game (+10 each non-dead)</Label>
            <Switch 
              value={isWallGame} 
              onValueChange={setIsWallGame}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={isWallGame ? colors.card : colors.textSecondary}
            />
          </Row>
          <Row>
            <Label>Time Expired (everyone 0)</Label>
            <Switch 
              value={timeExpired} 
              onValueChange={setTimeExpired}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={timeExpired ? colors.card : colors.textSecondary}
            />
          </Row>

          {/* Dead hands (no wall bonus) */}
          <View style={{ marginTop: 8 }}>
            <Label>Mark Dead Hands (no +10 on Wall)</Label>
            <Row><Text style={styles.labelText}>N dead</Text><Switch 
              value={deadN} 
              onValueChange={setDeadN}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={deadN ? colors.card : colors.textSecondary}
            /></Row>
            <Row><Text style={styles.labelText}>E dead</Text><Switch 
              value={deadE} 
              onValueChange={setDeadE}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={deadE ? colors.card : colors.textSecondary}
            /></Row>
            <Row><Text style={styles.labelText}>W dead</Text><Switch 
              value={deadW} 
              onValueChange={setDeadW}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={deadW ? colors.card : colors.textSecondary}
            /></Row>
            <Row><Text style={styles.labelText}>S dead</Text><Switch 
              value={deadS} 
              onValueChange={setDeadS}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={deadS ? colors.card : colors.textSecondary}
            /></Row>
          </View>
        </>
      )}

      {/* Output */}
      <View style={styles.resultsSection}>
        {mode === "standard" ? (
          <>
            <Text style={styles.resultsTitle}>Standard Breakdown</Text>

            {/* Base NMJL multipliers in play */}
            {winType === "self_pick" ? (
              <Text style={styles.resultText}>Pattern: Self-Pick → everyone pays ×{(result.rule.allMultiplier ?? 0).toString()}</Text>
            ) : (
              <Text style={styles.resultText}>
                Pattern: Discard → discarder ×{result.rule.discarderMultiplier ?? 0}, others ×{result.rule.otherMultiplier ?? 0}
              </Text>
            )}
            <Text style={styles.resultText}>Jokerless applied: {result.rule.jokerlessApplied ? "Yes" : "No"}</Text>
            {result.rule.misnamedJokerApplied && (
              <Text style={styles.resultText}>Misnamed Joker: Yes (discarder pays 4×, others pay nothing)</Text>
            )}

            {/* No-Exposures description */}
            {result.appliedNoExposureBonus ? (
              <Text style={[styles.resultText, { marginTop: 4 }]}>
                No-Exposures bonus:{" "}
                {result.appliedNoExposureBonus.suppressed
                  ? "Suppressed (Concealed Only hand)"
                  : result.appliedNoExposureBonus.applied
                  ? `${result.appliedNoExposureBonus.mode === "flat" ? "+" : "×"}${result.appliedNoExposureBonus.value}`
                  : "No"}
              </Text>
            ) : null}

            {/* Per-payer */}
            <View style={styles.paymentSection}>
              {winType === "discard" ? (
                <>
                  <Text style={styles.paymentText}>Discarder pays: ${((result.perLoserAmounts.discarder ?? 0) / 100).toFixed(2)}</Text>
                  <Text style={styles.paymentText}>Each other player pays: ${((result.perLoserAmounts.others ?? 0) / 100).toFixed(2)}</Text>
                </>
              ) : (
                <Text style={styles.paymentText}>Each opponent pays: ${((result.perLoserAmounts.others ?? 0) / 100).toFixed(2)}</Text>
              )}
              <Text style={styles.totalText}>
                Total to Winner: ${(result.totalToWinner / 100).toFixed(2)}
              </Text>
            </View>

            {/* Optional: show payer map if IDs were passed */}
            {Object.keys(result.payerMap || {}).length > 0 && (
              <View style={styles.payerMapSection}>
                <Text style={styles.payerMapTitle}>Per Player</Text>
                {Object.entries(result.payerMap).map(([pid, amt]) => (
                  <Text key={pid} style={styles.resultText}>
                    {pid}: {amt > 0 ? `pays $${(amt / 100).toFixed(2)}` : `receives $${(Math.abs(amt) / 100).toFixed(2)}`}
                  </Text>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.resultsTitle}>Tournament Points</Text>
            {tournamentResult && (
              <>
                {Object.entries(tournamentResult.pointsByPlayer).map(([pid, pts]) => (
                  <Text key={pid} style={styles.resultText}>
                    {pid}: {pts >= 0 ? `+${pts}` : pts}
                  </Text>
                ))}
                <View style={{ marginTop: 8 }}>
                  {tournamentResult.breakdown.map((line, i) => (
                    <Text key={i} style={[styles.resultText, { color: colors.textSecondary }]}>• {line}</Text>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  container: {
    padding: 20,
    paddingBottom: 32,
    borderRadius: 12,
    backgroundColor: colors.card,
    gap: 16,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: -20,
    marginTop: -20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
  },
  section: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  labelContainer: {
    flex: 1,
    paddingRight: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  labelSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    marginTop: 6,
  },
  segButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  segButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  segButtonUnselected: {
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  segText: {
    fontWeight: '500',
  },
  segTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  segTextUnselected: {
    color: colors.text,
  },
  resultsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultsTitle: {
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 16,
    color: colors.text,
  },
  resultText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  paymentSection: {
    marginTop: 12,
  },
  paymentText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  totalText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
    color: colors.primary,
  },
  payerMapSection: {
    marginTop: 12,
  },
  payerMapTitle: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 14,
    color: colors.text,
  },
});

