import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, Image, ScrollView, Modal, Alert } from "react-native";
import { computeNmjlStandard, computeTournament } from "@/lib/scoring/engine";
import type { WinType, NoExposureBonusConfig } from "@/lib/scoring/types";
import { useTheme } from "@/contexts/ThemeContext";
import { getColors } from "@/constants/colors";
import { FontAwesome5 } from '@expo/vector-icons';
import { saveHand } from "@/lib/storage/handStorage";
import { SavedHand } from "@/lib/types/game";
import { HAND_CATEGORIES, getHandsByCategory, getCategoryById, formatHandName } from "@/lib/data/handCategories";

/** Small UI helpers */
function Row({ children, style, colors }: any) {
  return <View style={[styles.row(colors), style]}>{children}</View>;
}
function Label({ children, sub, colors }: { children: React.ReactNode; sub?: string; colors: any }) {
  return (
    <View style={styles.labelContainer(colors)}>
      <Text style={styles.labelText(colors)}>{children}</Text>
      {sub ? <Text style={styles.labelSubtext(colors)}>{sub}</Text> : null}
    </View>
  );
}
function Seg({ selected, onPress, children, colors }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.segButton(colors),
        selected ? styles.segButtonSelected(colors) : styles.segButtonUnselected(colors)
      ]}
    >
      <Text style={[
        styles.segText(colors),
        selected ? styles.segTextSelected(colors) : styles.segTextUnselected(colors)
      ]}>{children}</Text>
    </TouchableOpacity>
  );
}

type Mode = "standard" | "tournament";

type Props = {
  
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
  const { theme, setTheme } = useTheme();
  const colors = getColors(theme);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  // Currency/Points selector
  const [displayMode, setDisplayMode] = useState<"currency" | "points">("currency");
  
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
  const [noExpMode, setNoExpMode] = useState<NoExposureBonusConfig["mode"]>("multiplier"); // "flat" | "multiplier"
  const [noExpValue, setNoExpValue] = useState<string>("2"); // default ×2 multiplier

  // New modifier controls
  const [totalExposuresAtTable, setTotalExposuresAtTable] = useState<string>("0");
  const [jokerlessAsPoints, setJokerlessAsPoints] = useState(false);
  const [jokerlessBonusPoints, setJokerlessBonusPoints] = useState<string>("10");
  const [exposurePenaltyEnabled, setExposurePenaltyEnabled] = useState(false);
  const [exposurePenaltyPerExposure, setExposurePenaltyPerExposure] = useState<string>("5");
  const [standardWinnerExposureCount, setStandardWinnerExposureCount] = useState<string>("0");

  // Table size
  const [numPlayers, setNumPlayers] = useState<number>(defaultNumPlayers);

  // Hand saving
  const [handName, setHandName] = useState<string>("");
  const [isWinner, setIsWinner] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Hand category and selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedHand, setSelectedHand] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showHandModal, setShowHandModal] = useState(false);

  // Get available hands for selected category
  const availableHands = useMemo(() => {
    if (!selectedCategoryId) return [];
    return getHandsByCategory(selectedCategoryId);
  }, [selectedCategoryId]);

  // Update hand name when hand is selected
  useEffect(() => {
    if (selectedHand && selectedCategoryId) {
      const formattedName = formatHandName(selectedCategoryId, selectedHand);
      setHandName(formattedName);
    }
  }, [selectedHand, selectedCategoryId]);

  // Reset hand selection when category changes
  useEffect(() => {
    setSelectedHand("");
    setHandName("");
  }, [selectedCategoryId]);

  // Build config object for bonus (or omit it entirely if not enabled)
  const noExposureBonus =
    noExposures
      ? ({
          mode: noExpMode,
          value: Number(noExpValue || 0),
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
      misnamedJoker,
      winnerId,
      discarderId,
      otherPlayerIds,
      totalExposuresAtTable: Number(totalExposuresAtTable || 0),
      jokerlessAsPoints: jokerlessAsPoints,
      jokerlessBonusPoints: Number(jokerlessBonusPoints || 10),
      exposurePenaltyPerExposure: exposurePenaltyEnabled ? Number(exposurePenaltyPerExposure || 0) : 0,
      winnerExposureCount: Number(standardWinnerExposureCount || 0)
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
    misnamedJoker,
    winnerId,
    discarderId,
    otherPlayerIds,
    totalExposuresAtTable,
    jokerlessAsPoints,
    jokerlessBonusPoints,
    exposurePenaltyEnabled,
    exposurePenaltyPerExposure,
    standardWinnerExposureCount
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
    <>
      <ScrollView style={styles.scrollView(colors)} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container(colors)}>
          <View style={styles.header(colors)}>
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
              <Text style={styles.headerTitle(colors)}>Score Calculator</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowThemeMenu(true)} 
              style={styles.menuButton}
            >
              <FontAwesome5 name="ellipsis-v" size={20} color={colors.card} />
            </TouchableOpacity>
          </View>

        {/* Currency/Points Selector */}
        <View style={styles.section}>
          <Label colors={colors}>Display Format</Label>
          <Row style={{ justifyContent: "flex-start" }} colors={colors}>
            <Seg selected={displayMode === "currency"} onPress={() => setDisplayMode("currency")} colors={colors}>$$ (Money)</Seg>
            <Seg selected={displayMode === "points"} onPress={() => setDisplayMode("points")} colors={colors}>Points</Seg>
          </Row>
        </View>

        {/* Mode Selection */}
        <View style={styles.section}>
          <Label colors={colors}>Calculator Mode</Label>
          <Row style={{ justifyContent: "flex-start" }} colors={colors}>
            <Seg selected={mode === "standard"} onPress={() => setMode("standard")} colors={colors}>Standard</Seg>
            <Seg selected={mode === "tournament"} onPress={() => setMode("tournament")} colors={colors}>Tournament</Seg>
          </Row>
        </View>

        {/* Hand Category Selection */}
        <View>
          <Label colors={colors} sub="Select the category of your hand">Hand Category</Label>
          <TouchableOpacity
            style={styles.dropdownButton(colors)}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[styles.dropdownText(colors), !selectedCategoryId && styles.dropdownPlaceholder(colors)]}>
              {selectedCategoryId ? getCategoryById(selectedCategoryId)?.name || "Select Category" : "Select Category"}
            </Text>
            <FontAwesome5 name="chevron-down" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hand Selection - Only show if category is selected */}
        {selectedCategoryId && (
          <View>
            <Label colors={colors} sub="Select the specific line number from the category">Line number</Label>
            <TouchableOpacity
              style={styles.dropdownButton(colors)}
              onPress={() => {
                if (availableHands.length > 0) {
                  setShowHandModal(true);
                } else {
                  Alert.alert("No Hands Available", "This category doesn't have any hands available.");
                }
              }}
              disabled={availableHands.length === 0}
            >
              <Text style={[
                styles.dropdownText(colors), 
                !selectedHand && styles.dropdownPlaceholder(colors),
                availableHands.length === 0 && { opacity: 0.5 }
              ]}>
                {selectedHand || (availableHands.length === 0 ? "No hands available" : "Select Line number")}
              </Text>
              <FontAwesome5 name="chevron-down" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Base points */}
        <View>
          <Label colors={colors} sub="Type the printed value from your NMJL card (points or cents).">Base Points</Label>
          <TextInput
            keyboardType="number-pad"
            value={basePoints}
            onChangeText={setBasePoints}
            placeholder="e.g., 25"
            placeholderTextColor={colors.textSecondary}
            style={styles.textInput(colors)}
          />
        </View>

        {/* Standard Mode Controls */}
        {mode === "standard" && (
          <>

      {/* Win Type */}
      <View style={{ marginTop: 4 }}>
        <Label colors={colors}>Win Type</Label>
        <Row style={{ justifyContent: "flex-start" }} colors={colors}>
          <Seg selected={winType === "self_pick"} onPress={() => setWinType("self_pick")} colors={colors}>Self-Pick</Seg>
          <Seg selected={winType === "discard"} onPress={() => setWinType("discard")} colors={colors}>From Discard</Seg>
        </Row>
      </View>

      {/* Total Exposures at Table (for discard payout rule) */}
      {winType === "discard" && (
        <View style={{ marginTop: 8 }}>
          <Label colors={colors} sub="Total exposures at table (0-2 = ×2 discarder, 3+ = ×all discarder)">Total Exposures at Table</Label>
          <TextInput
            keyboardType="number-pad"
            value={totalExposuresAtTable}
            onChangeText={setTotalExposuresAtTable}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            style={styles.textInput(colors)}
          />
        </View>
      )}

      {/* Winner Exposure Count (for exposure penalty) */}
      <View style={{ marginTop: 8 }}>
        <Label colors={colors} sub="Winner's exposure count (for exposure penalty calculation)">Winner's Exposure Count</Label>
        <TextInput
          keyboardType="number-pad"
          value={standardWinnerExposureCount}
          onChangeText={setStandardWinnerExposureCount}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          style={styles.textInput(colors)}
        />
      </View>

      {/* No-Exposures Bonus */}
      <View style={{ marginTop: 8, paddingTop: 8, borderTopColor: colors.border, borderTopWidth: 1 }}>
        <Row colors={colors}>
          <Label colors={colors} sub="Award for a fully concealed win (alternate/tournament rule).">No Exposures (Fully Concealed)</Label>
          <Switch 
            value={noExposures} 
            onValueChange={setNoExposures}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={noExposures ? colors.card : colors.textSecondary}
          />
        </Row>

        {/* Jokerless */}
        <Row colors={colors}>
          <Label colors={colors} sub="No jokers anywhere in the hand.">Jokerless</Label>
          <Switch 
            value={jokerless} 
            onValueChange={setJokerless}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={jokerless ? colors.card : colors.textSecondary}
          />
        </Row>

        {jokerless && (
          <>
            <Row colors={colors}>
              <Label colors={colors} sub="Add points instead of using multiplier">Jokerless as Points Bonus</Label>
              <Switch 
                value={jokerlessAsPoints} 
                onValueChange={setJokerlessAsPoints}
                trackColor={{ false: colors.border, true: colors.gobutton }}
                thumbColor={jokerlessAsPoints ? colors.card : colors.textSecondary}
              />
            </Row>
            {jokerlessAsPoints && (
              <View style={{ marginTop: 6 }}>
                <Label colors={colors}>Jokerless Bonus Points</Label>
                <TextInput
                  keyboardType="number-pad"
                  value={jokerlessBonusPoints}
                  onChangeText={setJokerlessBonusPoints}
                  placeholder="10"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.textInput(colors)}
                />
              </View>
            )}
          </>
        )}

        {/* Exposure Penalty */}
        <View style={{ marginTop: 8, paddingTop: 8, borderTopColor: colors.border, borderTopWidth: 1 }}>
          <Row colors={colors}>
            <Label colors={colors} sub="Optional house rule: penalty per exposure">Exposure Penalty</Label>
            <Switch 
              value={exposurePenaltyEnabled} 
              onValueChange={setExposurePenaltyEnabled}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={exposurePenaltyEnabled ? colors.card : colors.textSecondary}
            />
          </Row>
          {exposurePenaltyEnabled && (
            <View style={{ marginTop: 6 }}>
              <Label colors={colors} sub="Penalty per exposure (5-10 points)">Penalty Per Exposure</Label>
              <TextInput
                keyboardType="number-pad"
                value={exposurePenaltyPerExposure}
                onChangeText={setExposurePenaltyPerExposure}
                placeholder="5"
                placeholderTextColor={colors.textSecondary}
                style={styles.textInput(colors)}
              />
            </View>
          )}
        </View>

        {noExposures && (
          <>
            <Label colors={colors} sub="Choose whether the bonus is a flat add or a multiplier applied to each payer.">Bonus Type</Label>
            <Row style={{ justifyContent: "flex-start" }} colors={colors}>
              <Seg selected={noExpMode === "flat"} onPress={() => setNoExpMode("flat")} colors={colors}>Flat (+)</Seg>
              <Seg selected={noExpMode === "multiplier"} onPress={() => setNoExpMode("multiplier")} colors={colors}>Multiplier (×)</Seg>
            </Row>

            <View style={{ marginTop: 6 }}>
              <Label colors={colors}>{noExpMode === "flat" ? "Flat Bonus Amount" : "Multiplier Value"}</Label>
              <TextInput
                keyboardType="decimal-pad"
                value={noExpValue}
                onChangeText={setNoExpValue}
                placeholder={noExpMode === "flat" ? "e.g., 10" : "e.g., 2"}
                placeholderTextColor={colors.textSecondary}
                style={styles.textInput(colors)}
              />
            </View>
          </>
        )}
      </View>

      {/* Misnamed Joker - only show for discard wins */}
      {winType === "discard" && (
        <View style={{ marginTop: 8, paddingTop: 8, borderTopColor: colors.border, borderTopWidth: 1 }}>
          <Row colors={colors}>
            <Label colors={colors} sub="The player who discarded pays 4× base, others pay nothing.">Misnamed Joker</Label>
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
            <Label colors={colors}>Players</Label>
            <Row style={{ justifyContent: "flex-start" }} colors={colors}>
              {[2, 3, 4].map((n) => (
                <Seg key={n} selected={numPlayers === n} onPress={() => setNumPlayers(n)} colors={colors}>
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
            <Label colors={colors}>Win Type</Label>
            <Row style={{ justifyContent: "flex-start" }} colors={colors}>
              <Seg selected={winType === "self_pick"} onPress={() => setWinType("self_pick")} colors={colors}>Self-Pick</Seg>
              <Seg selected={winType === "discard"} onPress={() => setWinType("discard")} colors={colors}>From Discard</Seg>
            </Row>
          </View>

          {/* Tournament-specific toggles */}
          <Row colors={colors}>
            <Label colors={colors}>Self-Pick Bonus (+10)</Label>
            <Switch 
              value={selfPick} 
              onValueChange={setSelfPick}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={selfPick ? colors.card : colors.textSecondary}
            />
          </Row>
          <Row colors={colors}>
            <Label colors={colors} sub="No jokers anywhere.">Jokerless (+20)</Label>
            <Switch 
              value={jokerless} 
              onValueChange={setJokerless}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={jokerless ? colors.card : colors.textSecondary}
            />
          </Row>

          {/* Winner & discarder selection */}
          <View style={{ marginTop: 8 }}>
            <Label colors={colors}>Winner</Label>
            <Row style={{ justifyContent: "flex-start" }} colors={colors}>
              {playerIds.map(id => (
                <Seg key={id} selected={tournamentWinnerId === id} onPress={() => setTournamentWinnerId(id)} colors={colors}>{id}</Seg>
              ))}
            </Row>
          </View>

          {winType === "discard" && (
            <View style={{ marginTop: 8 }}>
              <Label colors={colors}>Discarder</Label>
              <Row style={{ justifyContent: "flex-start" }} colors={colors}>
                {playerIds.filter(id => id !== tournamentWinnerId).map(id => (
                  <Seg key={id} selected={tournamentDiscarderId === id} onPress={() => setTournamentDiscarderId(id)} colors={colors}>{id}</Seg>
                ))}
              </Row>
            </View>
          )}

          <View style={{ marginTop: 8 }}>
            <Label colors={colors} sub="Winner's exposures at time of win determine discarder penalty (0–1 => -10; 2+ => -20).">
              Winner Exposure Count
            </Label>
            <Row style={{ justifyContent: "flex-start" }} colors={colors}>
              {[0,1,2,3,4].map(n => (
                <Seg key={n} selected={winnerExposureCount === n} onPress={() => setWinnerExposureCount(n as 0|1|2|3|4)} colors={colors}>
                  {n}
                </Seg>
              ))}
            </Row>
          </View>

          {/* Wall / Time-expired */}
          <Row colors={colors}>
            <Label colors={colors}>Wall Game (+10 each non-dead)</Label>
            <Switch 
              value={isWallGame} 
              onValueChange={setIsWallGame}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={isWallGame ? colors.card : colors.textSecondary}
            />
          </Row>
          <Row colors={colors}>
            <Label colors={colors}>Time Expired (everyone 0)</Label>
            <Switch 
              value={timeExpired} 
              onValueChange={setTimeExpired}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={timeExpired ? colors.card : colors.textSecondary}
            />
          </Row>

          {/* Dead hands (no wall bonus) */}
          <View style={{ marginTop: 8 }}>
            <Label colors={colors}>Mark Dead Hands (no +10 on Wall)</Label>
            <Row colors={colors}><Text style={styles.labelText(colors)}>N dead</Text><Switch 
              value={deadN} 
              onValueChange={setDeadN}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={deadN ? colors.card : colors.textSecondary}
            /></Row>
            <Row colors={colors}><Text style={styles.labelText(colors)}>E dead</Text><Switch 
              value={deadE} 
              onValueChange={setDeadE}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={deadE ? colors.card : colors.textSecondary}
            /></Row>
            <Row colors={colors}><Text style={styles.labelText(colors)}>W dead</Text><Switch 
              value={deadW} 
              onValueChange={setDeadW}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={deadW ? colors.card : colors.textSecondary}
            /></Row>
            <Row colors={colors}><Text style={styles.labelText(colors)}>S dead</Text><Switch 
              value={deadS} 
              onValueChange={setDeadS}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={deadS ? colors.card : colors.textSecondary}
            /></Row>
          </View>
        </>
      )}

      {/* Output */}
      <View style={styles.resultsSection(colors)}>
        {mode === "standard" ? (
          <>
            <Text style={styles.resultsTitle(colors)}>Standard Breakdown</Text>

            {/* Base NMJL multipliers in play */}
            {winType === "self_pick" ? (
              <Text style={styles.resultText(colors)}>Pattern: Self-Pick → everyone pays ×{(result.rule.allMultiplier ?? 0).toString()}</Text>
            ) : (
              <Text style={styles.resultText(colors)}>
                Pattern: Discard → discarder ×{result.rule.discarderMultiplier ?? 0}, others ×{result.rule.otherMultiplier ?? 0}
              </Text>
            )}
            <Text style={styles.resultText(colors)}>Jokerless applied: {result.rule.jokerlessApplied ? "Yes" : "No"}</Text>
            {result.rule.misnamedJokerApplied && (
              <Text style={styles.resultText(colors)}>Misnamed Joker: Yes (discarder pays 4×, others pay nothing)</Text>
            )}

            {/* No-Exposures description */}
            {result.appliedNoExposureBonus && result.appliedNoExposureBonus.applied && (
              <Text style={[styles.resultText(colors), { marginTop: 4 }]}>
                No-Exposures bonus: {result.appliedNoExposureBonus.mode === "flat" ? "+" : "×"}{result.appliedNoExposureBonus.value}
              </Text>
            )}

            {/* Per-payer */}
            <View style={styles.paymentSection}>
              {winType === "discard" ? (
                <>
                  <Text style={styles.paymentText(colors)}>
                    Discarder pays: {displayMode === "currency" 
                      ? `$${((result.perLoserAmounts.discarder ?? 0) / 100).toFixed(2)}`
                      : `${result.perLoserAmounts.discarder ?? 0} pts`}
                  </Text>
                  <Text style={styles.paymentText(colors)}>
                    Each other player pays: {displayMode === "currency"
                      ? `$${((result.perLoserAmounts.others ?? 0) / 100).toFixed(2)}`
                      : `${result.perLoserAmounts.others ?? 0} pts`}
                  </Text>
                </>
              ) : (
                <Text style={styles.paymentText(colors)}>
                  Each opponent pays: {displayMode === "currency"
                    ? `$${((result.perLoserAmounts.others ?? 0) / 100).toFixed(2)}`
                    : `${result.perLoserAmounts.others ?? 0} pts`}
                </Text>
              )}
              {result.jokerlessPointsBonus && result.jokerlessPointsBonus > 0 && (
                <Text style={styles.resultText(colors)}>
                  Jokerless bonus: +{result.jokerlessPointsBonus} {displayMode === "currency" ? "cents" : "pts"}
                </Text>
              )}
              {result.exposurePenalty && result.exposurePenalty > 0 && (
                <Text style={styles.resultText(colors)}>
                  Exposure penalty: -{result.exposurePenalty} {displayMode === "currency" ? "cents" : "pts"}
                </Text>
              )}
              <Text style={styles.totalText(colors)}>
                Total to Winner: {displayMode === "currency"
                  ? `$${(result.totalToWinner / 100).toFixed(2)}`
                  : `${result.totalToWinner} pts`}
              </Text>
            </View>

            {/* Save Hand Section - Only for Standard Mode */}
            {mode === "standard" && (
              <View style={[styles.resultsSection(colors), { marginTop: 20 }]}>
                <Label colors={colors}>Save This Hand</Label>
                <Row colors={colors}>
                  <Label colors={colors} sub="Were you the winner of this hand?">I Was the Winner</Label>
                  <Switch 
                    value={isWinner} 
                    onValueChange={setIsWinner}
                    trackColor={{ false: colors.border, true: colors.gobutton }}
                    thumbColor={isWinner ? colors.card : colors.textSecondary}
                  />
                </Row>
                <TouchableOpacity
                  style={[styles.saveButton(colors), saveSuccess && styles.saveButtonSuccess(colors)]}
                  onPress={async () => {
                  if (!selectedCategoryId || !selectedHand) {
                    Alert.alert("Hand Selection Required", "Please select a category and hand number to save.");
                    return;
                  }
                    try {
                      const handToSave: SavedHand = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        timestamp: Date.now(),
                        handName: handName.trim(),
                        basePoints: Number(basePoints || 0),
                        winType,
                        jokerless,
                        singlesAndPairs,
                        noExposures,
                        totalToWinner: result.totalToWinner,
                        displayMode,
                        mode,
                        totalExposuresAtTable: Number(totalExposuresAtTable || 0),
                        jokerlessAsPoints,
                        jokerlessBonusPoints: Number(jokerlessBonusPoints || 10),
                        exposurePenalty: result.exposurePenalty,
                        winnerExposureCount: Number(standardWinnerExposureCount || 0),
                        perLoserAmounts: result.perLoserAmounts,
                        isWinner,
                      };
                      await saveHand(handToSave);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2000);
                      Alert.alert("Saved!", "Hand saved successfully.");
                    } catch (error) {
                      Alert.alert("Error", "Failed to save hand. Please try again.");
                      console.error("Save error:", error);
                    }
                  }}
                >
                  <FontAwesome5 
                    name={saveSuccess ? "check" : "save"} 
                    size={16} 
                    color={colors.card} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={styles.saveButtonText(colors)}>
                    {saveSuccess ? "Saved!" : "Save Hand"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Optional: show payer map if IDs were passed */}
            {Object.keys(result.payerMap || {}).length > 0 && (
              <View style={styles.payerMapSection}>
                <Text style={styles.payerMapTitle(colors)}>Per Player</Text>
                {Object.entries(result.payerMap).map(([pid, amt]) => (
                  <Text key={pid} style={styles.resultText(colors)}>
                    {pid}: {amt > 0 
                      ? `pays ${displayMode === "currency" ? `$${(amt / 100).toFixed(2)}` : `${amt} pts`}`
                      : `receives ${displayMode === "currency" ? `$${(Math.abs(amt) / 100).toFixed(2)}` : `${Math.abs(amt)} pts`}`}
                  </Text>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.resultsTitle(colors)}>Tournament Points</Text>
            {tournamentResult && (
              <>
                {Object.entries(tournamentResult.pointsByPlayer).map(([pid, pts]) => (
                  <Text key={pid} style={styles.resultText(colors)}>
                    {pid}: {pts >= 0 ? `+${pts}` : pts}
                  </Text>
                ))}
                <View style={{ marginTop: 8 }}>
                  {tournamentResult.breakdown.map((line, i) => (
                    <Text key={i} style={[styles.resultText(colors), { color: colors.textSecondary }]}>• {line}</Text>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </View>
      </View>
    </ScrollView>

    {/* Theme Menu Modal */}
    <Modal
      visible={showThemeMenu}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowThemeMenu(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay(colors)}
        activeOpacity={1}
        onPress={() => setShowThemeMenu(false)}
      >
        <View style={styles.themeMenu(colors)}>
          <Text style={styles.themeMenuTitle(colors)}>Theme</Text>
          <TouchableOpacity
            style={styles.themeOption(colors, theme === 'light')}
            onPress={() => {
              setTheme('light');
              setShowThemeMenu(false);
            }}
          >
            <FontAwesome5 name="sun" size={16} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.themeOptionText(colors)}>Light Mode</Text>
            {theme === 'light' && <FontAwesome5 name="check" size={16} color={colors.primary} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.themeOption(colors, theme === 'dark')}
            onPress={() => {
              setTheme('dark');
              setShowThemeMenu(false);
            }}
          >
            <FontAwesome5 name="moon" size={16} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.themeOptionText(colors)}>Dark Mode</Text>
            {theme === 'dark' && <FontAwesome5 name="check" size={16} color={colors.primary} />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>

    {/* Category Selection Modal */}
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlayBottom(colors)}
        activeOpacity={1}
        onPress={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalContent(colors)}>
          <View style={styles.modalHeader(colors)}>
            <Text style={styles.modalTitle(colors)}>Select Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView}>
            {HAND_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.modalOption(colors),
                  selectedCategoryId === category.id && styles.modalOptionSelected(colors)
                ]}
                onPress={() => {
                  setSelectedCategoryId(category.id);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText(colors),
                  selectedCategoryId === category.id && styles.modalOptionTextSelected(colors)
                ]}>
                  {category.name}
                </Text>
                {selectedCategoryId === category.id && (
                  <FontAwesome5 name="check" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>

    {/* Hand Selection Modal */}
    <Modal
      visible={showHandModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowHandModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlayBottom(colors)}
        activeOpacity={1}
        onPress={() => setShowHandModal(false)}
      >
        <View style={styles.modalContent(colors)}>
          <View style={styles.modalHeader(colors)}>
            <Text style={styles.modalTitle(colors)}>
              Select Hand {selectedCategoryId ? `(${getCategoryById(selectedCategoryId)?.name})` : ''}
            </Text>
            <TouchableOpacity onPress={() => setShowHandModal(false)}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView}>
            {availableHands.length === 0 ? (
              <View style={styles.modalOption(colors)}>
                <Text style={styles.modalOptionText(colors)}>
                  No hands available in this category.
                </Text>
              </View>
            ) : (
              availableHands.map((handNumber) => {
                const formattedName = formatHandName(selectedCategoryId, handNumber);
                return (
                  <TouchableOpacity
                    key={handNumber}
                    style={[
                      styles.modalOption(colors),
                      selectedHand === handNumber && styles.modalOptionSelected(colors)
                    ]}
                    onPress={() => {
                      setSelectedHand(handNumber);
                      setShowHandModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText(colors),
                      selectedHand === handNumber && styles.modalOptionTextSelected(colors)
                    ]}>
                      {formattedName}
                    </Text>
                    {selectedHand === handNumber && (
                      <FontAwesome5 name="check" size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
    </>
  );
}

const styles = {
  scrollView: (colors: any) => ({
    flex: 1,
    backgroundColor: colors.background,
  }),
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  container: (colors: any) => ({
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
  }),
  header: (colors: any) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.primary,
    marginHorizontal: -20,
    marginTop: -20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  }),
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    justifyContent: 'center' as const,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  closeButton: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
  menuButton: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
  headerTitle: (colors: any) => ({
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.card,
  }),
  section: {
    marginBottom: 16,
  },
  row: (colors: any) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginVertical: 6,
  }),
  labelContainer: (colors: any) => ({
    flex: 1,
    paddingRight: 8,
  }),
  labelText: (colors: any) => ({
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  }),
  labelSubtext: (colors: any) => ({
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  }),
  textInput: (colors: any) => ({
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    marginTop: 6,
  }),
  segButton: (colors: any) => ({
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  }),
  segButtonSelected: (colors: any) => ({
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  }),
  segButtonUnselected: (colors: any) => ({
    borderColor: colors.border,
    backgroundColor: colors.card,
  }),
  segText: (colors: any) => ({
    fontWeight: '500' as const,
  }),
  segTextSelected: (colors: any) => ({
    fontWeight: '700' as const,
    color: colors.primary,
  }),
  segTextUnselected: (colors: any) => ({
    color: colors.text,
  }),
  resultsSection: (colors: any) => ({
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  }),
  resultsTitle: (colors: any) => ({
    fontWeight: '700' as const,
    marginBottom: 8,
    fontSize: 16,
    color: colors.text,
  }),
  resultText: (colors: any) => ({
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  }),
  paymentSection: {
    marginTop: 12,
  },
  paymentText: (colors: any) => ({
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 6,
  }),
  totalText: (colors: any) => ({
    fontSize: 15,
    fontWeight: '700' as const,
    marginTop: 8,
    color: colors.primary,
  }),
  payerMapSection: {
    marginTop: 12,
  },
  payerMapTitle: (colors: any) => ({
    fontWeight: '600' as const,
    marginBottom: 6,
    fontSize: 14,
    color: colors.text,
  }),
  modalOverlay: (colors: any) => ({
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  }),
  themeMenu: (colors: any) => ({
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    minWidth: 200,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }),
  themeMenuTitle: (colors: any) => ({
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  }),
  themeOption: (colors: any, selected: boolean) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: selected ? colors.primaryLight + '20' : 'transparent',
    marginBottom: 8,
  }),
  themeOptionText: (colors: any) => ({
    fontSize: 16,
    color: colors.text,
    flex: 1,
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
  saveButtonSuccess: (colors: any) => ({
    backgroundColor: '#4CAF50',
  }),
  saveButtonText: (colors: any) => ({
    color: colors.card,
    fontSize: 16,
    fontWeight: '700' as const,
  }),
  dropdownButton: (colors: any) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  }),
  dropdownText: (colors: any) => ({
    fontSize: 16,
    color: colors.text,
    flex: 1,
  }),
  dropdownPlaceholder: (colors: any) => ({
    color: colors.textSecondary,
  }),
  modalOverlayBottom: (colors: any) => ({
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  }),
  modalContent: (colors: any) => ({
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 600,
    paddingBottom: 20,
  }),
  modalHeader: (colors: any) => ({
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  }),
  modalTitle: (colors: any) => ({
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  }),
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: (colors: any) => ({
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  }),
  modalOptionSelected: (colors: any) => ({
    backgroundColor: colors.inputBackground,
  }),
  modalOptionText: (colors: any) => ({
    fontSize: 16,
    color: colors.text,
    flex: 1,
  }),
  modalOptionTextSelected: (colors: any) => ({
    color: colors.primary,
    fontWeight: '600' as const,
  }),
};

