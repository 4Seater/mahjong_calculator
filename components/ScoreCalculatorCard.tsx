import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TextInput, Switch, TouchableOpacity, Image, ScrollView, Modal, Alert } from "react-native";
import { styles } from "./ScoreCalculatorCard.styles";
import { computeNmjlStandard } from "@/lib/scoring/engine";
import type { WinType, NoExposureBonusConfig } from "@/lib/scoring/types";
import { chineseOfficialFans, fanPoints, handFanOptions } from "@/lib/scoring/chineseOfficialFans";
import { Hand, parseTiles, Tile } from "@/lib/scoring/chineseOfficial/tiles";
import { TileInputEngine, getTileDisplayName } from "@/lib/scoring/chineseOfficial/tileInputEngine";
import { enumerateStandardDecompositions } from "@/lib/scoring/chineseOfficial/melds";
import { useTheme } from "@/contexts/ThemeContext";
import { getColors } from "@/constants/colors";
import { FontAwesome5 } from '@expo/vector-icons';
import { saveHand } from "@/lib/storage/handStorage";
import { SavedHand } from "@/lib/types/game";
import { HAND_CATEGORIES, getHandsByCategory, getCategoryById, formatHandName } from "@/lib/data/handCategories";
import { getCustomRules, saveCustomRule, deleteCustomRule, type CustomRule } from "@/lib/storage/customRulesStorage";
import PrivacyPolicyScreen from "./PrivacyPolicyScreen";
import ContactUsScreen from "./ContactUsScreen";
import ChineseOfficialFanSelectionModal from "./ChineseOfficialFanSelectionModal";
import { useTournamentResult } from "./modes/useTournamentResult";
import ChineseOfficialTilePicker from "./modes/ChineseOfficialTilePicker";
import ChineseOfficialTileValidation from "./modes/ChineseOfficialTileValidation";
import ChineseOfficialFlowerPoints from "./modes/ChineseOfficialFlowerPoints";
import ChineseOfficialModeControls from "./modes/ChineseOfficialModeControls";
import { useChineseOfficialResult } from "./modes/useChineseOfficialResult";
import ChineseOfficialResultDisplay from "./modes/ChineseOfficialResultDisplay";
import CustomRulesSection from "./CustomRulesSection";
import ChineseOfficialClearButton from "./modes/ChineseOfficialClearButton";
import TournamentClearButton from "./modes/TournamentClearButton";
import StandardClearButton from "./modes/StandardClearButton";
import StandardSaveHand from "./modes/StandardSaveHand";
import StandardModeControls from "./modes/StandardModeControls";
import EditRuleModal from "./EditRuleModal";
import CustomRuleModal from "./CustomRuleModal";
import HandSelectionModal from "./HandSelectionModal";
import CategorySelectionModal from "./CategorySelectionModal";
import ModeSelectorModal from "./ModeSelectorModal";
import SettingsMenuModal from "./SettingsMenuModal";

/** Small UI helpers */
function Row({ children, style, colors }: any) {
  return <View style={[styles.row(colors), style]}>{children}</View>;
}
function RowWithEdit({ children, style, colors, onEdit, editKey }: any) {
  return (
    <View style={[styles.row(colors), style]}>
      {children}
      {onEdit && (
        <TouchableOpacity
          onPress={() => onEdit(editKey)}
          style={{ padding: 8, marginLeft: 8 }}
        >
          <FontAwesome5 name="edit" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}
function Label({ children, sub, colors }: { children: React.ReactNode; sub?: string; colors: any }) {
  return (
    <View style={styles.labelContainer(colors)}>
      <Text style={styles.labelText(colors)}>{children}</Text>
      {sub ? <Text style={styles.labelSubtext(colors)}>{sub}</Text> : null}
    </View>
  );
}
function Seg({ selected, onPress, children, colors, theme }: any) {
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
        selected ? styles.segTextSelected(colors, theme) : styles.segTextUnselected(colors)
      ]}>{children}</Text>
    </TouchableOpacity>
  );
}

type Mode = "standard" | "tournament" | "chineseOfficial";

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
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [showModeSelectorModal, setShowModeSelectorModal] = useState(false);
  
  // Currency/Points selector
  const [displayMode, setDisplayMode] = useState<"currency" | "points">("currency");
  
  // Mode selection - default to standard
  const [mode, setMode] = useState<Mode>("standard");

  // Inputs
  const [basePoints, setBasePoints] = useState<string>("0");
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

  // New modifier controls
  const [exposurePenaltyEnabled, setExposurePenaltyEnabled] = useState(false);
  const [exposurePenaltyPerExposure, setExposurePenaltyPerExposure] = useState<string>("5");
  const [standardWinnerExposureCount, setStandardWinnerExposureCount] = useState<string>("0");
  
  // Doubles and special rules
  const [lastTileFromWall, setLastTileFromWall] = useState(false);
  const [lastTileClaim, setLastTileClaim] = useState(false);
  const [robbingTheJoker, setRobbingTheJoker] = useState(false);
  const [eastDouble, setEastDouble] = useState(false);
  const [isWinnerEast, setIsWinnerEast] = useState(false);

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

  // Custom rules
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [selectedCustomRuleIds, setSelectedCustomRuleIds] = useState<Set<string>>(new Set());
  const [showCustomRuleModal, setShowCustomRuleModal] = useState(false);
  const [newCustomRuleTitle, setNewCustomRuleTitle] = useState<string>("");
  const [newCustomRuleDescription, setNewCustomRuleDescription] = useState<string>("");
  const [newCustomRuleType, setNewCustomRuleType] = useState<'multiplier' | 'points'>('multiplier');
  const [newCustomRuleValue, setNewCustomRuleValue] = useState<string>("");

  // Rule multiplier/points editing
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [editingRuleKey, setEditingRuleKey] = useState<string | null>(null);
  const [editRuleType, setEditRuleType] = useState<'multiplier' | 'points'>('multiplier');
  const [editRuleValue, setEditRuleValue] = useState<string>("");
  
  // Custom multipliers/points for rules
  const [customRuleValues, setCustomRuleValues] = useState<Record<string, { type: 'multiplier' | 'points', value: number }>>({});

  // Chinese Official mode state
  const [chineseOfficialSelectedFans, setChineseOfficialSelectedFans] = useState<Set<string>>(new Set());
  const [chineseOfficialFlowerCount, setChineseOfficialFlowerCount] = useState<string>("0");
  const [chineseOfficialIsSelfDraw, setChineseOfficialIsSelfDraw] = useState(false);
  const [chineseOfficialIsConcealed, setChineseOfficialIsConcealed] = useState(false);
  const [chineseOfficialPrevalentWindPung, setChineseOfficialPrevalentWindPung] = useState(false);
  const [chineseOfficialSeatWindPung, setChineseOfficialSeatWindPung] = useState(false);
  const [showChineseOfficialFanModal, setShowChineseOfficialFanModal] = useState(false);
  const [chineseOfficialHand, setChineseOfficialHand] = useState<Hand | null>(null);
  const [chineseOfficialOptimalResult, setChineseOfficialOptimalResult] = useState<any>(null);
  const [useOptimalSolver, setUseOptimalSolver] = useState(false);
  const [chineseOfficialInputMode, setChineseOfficialInputMode] = useState<'fanSelection' | 'tileInput'>('fanSelection');
  const [detectedFanIds, setDetectedFanIds] = useState<string[]>([]);
  
  // Manual tile input engine state
  const [tileInputEngine] = useState(() => new TileInputEngine());
  const [manualTiles, setManualTiles] = useState<Tile[]>([]);
  const [tileInputError, setTileInputError] = useState<string | null>(null);
  const [showTilePicker, setShowTilePicker] = useState(false);

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

  // Handle opening edit modal for a rule
  const handleEditRule = (ruleKey: string, defaultType: 'multiplier' | 'points', defaultValue: number) => {
    const custom = customRuleValues[ruleKey];
    setEditingRuleKey(ruleKey);
    setEditRuleType(custom?.type || defaultType);
    setEditRuleValue(custom?.value?.toString() || defaultValue.toString());
    setShowEditRuleModal(true);
  };

  // Handle saving edited rule
  const handleSaveEditRule = () => {
    if (!editingRuleKey || !editRuleValue) return;
    const value = parseFloat(editRuleValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert("Invalid Value", "Please enter a valid positive number.");
      return;
    }
    setCustomRuleValues({
      ...customRuleValues,
      [editingRuleKey]: { type: editRuleType, value }
    });
    setShowEditRuleModal(false);
    setEditingRuleKey(null);
    setEditRuleValue("");
  };

  // Reset hand selection when category changes
  useEffect(() => {
    setSelectedHand("");
    setHandName("");
  }, [selectedCategoryId]);

  // Disable exposure penalty when no exposures is enabled
  useEffect(() => {
    if (noExposures && exposurePenaltyEnabled) {
      setExposurePenaltyEnabled(false);
    }
  }, [noExposures]);

  // Load custom rules on mount
  useEffect(() => {
    const loadCustomRules = async () => {
      const rules = await getCustomRules();
      setCustomRules(rules);
    };
    loadCustomRules();
  }, []);

  // Build config object for bonus (or omit it entirely if not enabled)
  const noExposureBonus =
    noExposures
      ? ({
          mode: customRuleValues.noExposures?.type === 'points' ? 'flat' : 'multiplier',
          value: customRuleValues.noExposures?.value ?? 2, // Default ×2
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
      exposurePenaltyPerExposure: exposurePenaltyEnabled ? Number(exposurePenaltyPerExposure || 0) : 0,
      winnerExposureCount: Number(standardWinnerExposureCount || 0),
      lastTileFromWall,
      lastTileClaim,
      robbingTheJoker,
      eastDouble,
      isWinnerEast,
      customMultipliers: {
        jokerless: customRuleValues.jokerless?.type === 'multiplier' ? customRuleValues.jokerless.value : undefined,
        misnamedJoker: customRuleValues.misnamedJoker?.type === 'multiplier' ? customRuleValues.misnamedJoker.value : undefined,
        lastTileFromWall: customRuleValues.lastTileFromWall?.type === 'multiplier' ? customRuleValues.lastTileFromWall.value : undefined,
        lastTileClaim: customRuleValues.lastTileClaim?.type === 'multiplier' ? customRuleValues.lastTileClaim.value : undefined,
        robbingTheJoker: customRuleValues.robbingTheJoker?.type === 'multiplier' ? customRuleValues.robbingTheJoker.value : undefined,
      },
      customPoints: {
        jokerless: customRuleValues.jokerless?.type === 'points' ? customRuleValues.jokerless.value : undefined,
      },
      customRules: Array.from(selectedCustomRuleIds).map(id => {
        const rule = customRules.find(r => r.id === id);
        return rule ? { id: rule.id, type: rule.type, value: rule.value } : null;
      }).filter(Boolean) as Array<{ id: string; type: 'multiplier' | 'points'; value: number }>
    });
  }, [
    basePoints,
    winType,
    jokerless,
    singlesAndPairs,
    numPlayers,
    noExposures,
    misnamedJoker,
    winnerId,
    discarderId,
    otherPlayerIds,
    exposurePenaltyEnabled,
    exposurePenaltyPerExposure,
    standardWinnerExposureCount,
    lastTileFromWall,
    lastTileClaim,
    robbingTheJoker,
    eastDouble,
    isWinnerEast,
    selectedCustomRuleIds,
    customRules,
    customRuleValues
  ]);

  // Tournament result calculation
  const tournamentResult = useTournamentResult({
    mode,
    basePoints,
    winType,
    tournamentWinnerId,
    tournamentDiscarderId,
      playerIds,
      selfPick,
      jokerless,
      singlesAndPairs,
      winnerExposureCount,
      isWallGame,
    timeExpired,
    deadN,
    deadE,
    deadW,
    deadS,
    selectedCustomRuleIds,
    customRules,
  });

  // Chinese Official result calculation using custom hook
  const chineseOfficialResult = useChineseOfficialResult({
    mode,
    inputMode: chineseOfficialInputMode,
    selectedFans: chineseOfficialSelectedFans,
    flowerCount: chineseOfficialFlowerCount,
    isSelfDraw: chineseOfficialIsSelfDraw,
    isConcealed: chineseOfficialIsConcealed,
    prevalentWindPung: chineseOfficialPrevalentWindPung,
    seatWindPung: chineseOfficialSeatWindPung,
    hand: chineseOfficialHand,
    winnerId,
    discarderId,
    otherPlayerIds,
    onOptimalResultChange: setChineseOfficialOptimalResult,
    onDetectedFanIdsChange: setDetectedFanIds,
    onSelectedFansChange: setChineseOfficialSelectedFans,
  });

  useEffect(() => {
    onComputed?.(result);
  }, [result, onComputed]);

  // Set display format based on mode
  useEffect(() => {
    if (mode === "tournament") {
      setDisplayMode("points");
    } else if (mode === "standard") {
      setDisplayMode("currency");
    }
  }, [mode]);


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
              <Text style={styles.headerTitle(colors)}>Mahjong Score Calculator</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowThemeMenu(true)} 
              style={styles.menuButton}
            >
              <FontAwesome5 name="ellipsis-v" size={20} color={colors.card} />
            </TouchableOpacity>
          </View>

        {/* Mode Selection - At the top */}
        <View style={styles.section}>
          <Label colors={colors}>Calculator Mode</Label>
          <TouchableOpacity
            style={styles.dropdownButton(colors)}
            onPress={() => setShowModeSelectorModal(true)}
          >
            <Text style={styles.dropdownText(colors)}>
              {mode === "standard" ? "Standard (NMJL)" : mode === "tournament" ? "Tournament" : "Chinese Official"}
            </Text>
            <FontAwesome5 name="chevron-down" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Currency/Points Selector - Only show for standard/tournament modes */}
        {mode !== "chineseOfficial" && (
        <View style={styles.section}>
            <Label colors={colors}>Display Format</Label>
          <Row style={{ justifyContent: "flex-start" }} colors={colors}>
              <Seg selected={displayMode === "currency"} onPress={() => setDisplayMode("currency")} colors={colors} theme={theme}>$$ (Money)</Seg>
              <Seg selected={displayMode === "points"} onPress={() => setDisplayMode("points")} colors={colors} theme={theme}>Points</Seg>
          </Row>
        </View>
        )}

        {/* Standard/Tournament Mode Controls - Only show for standard/tournament */}
        {mode !== "chineseOfficial" && (
          <>
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
              <Label colors={colors} sub="Type the printed value from your NMJL card">Base Points</Label>
              <Text style={[styles.labelSubtext(colors), { marginTop: 2, marginBottom: 6 }]}>
                (points or cents)
              </Text>
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
          <StandardModeControls
            winType={winType}
            jokerless={jokerless}
            misnamedJoker={misnamedJoker}
            noExposures={noExposures}
            exposurePenaltyEnabled={exposurePenaltyEnabled}
            exposurePenaltyPerExposure={exposurePenaltyPerExposure}
            standardWinnerExposureCount={standardWinnerExposureCount}
            lastTileFromWall={lastTileFromWall}
            lastTileClaim={lastTileClaim}
            robbingTheJoker={robbingTheJoker}
            eastDouble={eastDouble}
            isWinnerEast={isWinnerEast}
            numPlayers={numPlayers}
            customRules={customRules}
            selectedCustomRuleIds={selectedCustomRuleIds}
            customRuleValues={customRuleValues}
            theme={theme}
            onWinTypeChange={setWinType}
            onJokerlessChange={setJokerless}
            onMisnamedJokerChange={setMisnamedJoker}
            onNoExposuresChange={setNoExposures}
            onExposurePenaltyEnabledChange={setExposurePenaltyEnabled}
            onExposurePenaltyPerExposureChange={setExposurePenaltyPerExposure}
            onStandardWinnerExposureCountChange={setStandardWinnerExposureCount}
            onLastTileFromWallChange={setLastTileFromWall}
            onLastTileClaimChange={setLastTileClaim}
            onRobbingTheJokerChange={setRobbingTheJoker}
            onEastDoubleChange={setEastDouble}
            onIsWinnerEastChange={setIsWinnerEast}
            onNumPlayersChange={setNumPlayers}
            onSelectedCustomRuleIdsChange={setSelectedCustomRuleIds}
            onCustomRulesChange={setCustomRules}
            onShowCustomRuleModal={() => {
              setNewCustomRuleTitle("");
              setNewCustomRuleDescription("");
              setNewCustomRuleType('multiplier');
              setNewCustomRuleValue("");
              setShowCustomRuleModal(true);
            }}
            onEditRule={handleEditRule}
          />
        )}
        </>
      )}

      {/* Tournament Mode Controls */}
      {mode === "tournament" && (
        <>
          {/* Win Type for Tournament */}
          <View style={{ marginTop: 4 }}>
            <Label colors={colors}>Win Type</Label>
            <Row style={{ justifyContent: "flex-start" }} colors={colors}>
              <Seg selected={winType === "self_pick"} onPress={() => setWinType("self_pick")} colors={colors} theme={theme}>Self-Pick</Seg>
              <Seg selected={winType === "discard"} onPress={() => setWinType("discard")} colors={colors} theme={theme}>From Discard</Seg>
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
                <Seg key={id} selected={tournamentWinnerId === id} onPress={() => setTournamentWinnerId(id)} colors={colors} theme={theme}>{id}</Seg>
              ))}
            </Row>
          </View>

          {winType === "discard" && (
            <View style={{ marginTop: 8 }}>
              <Label colors={colors}>Discarder</Label>
              <Row style={{ justifyContent: "flex-start" }} colors={colors}>
                {playerIds.filter(id => id !== tournamentWinnerId).map(id => (
                  <Seg key={id} selected={tournamentDiscarderId === id} onPress={() => setTournamentDiscarderId(id)} colors={colors} theme={theme}>{id}</Seg>
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
                <Seg key={n} selected={winnerExposureCount === n} onPress={() => setWinnerExposureCount(n as 0|1|2|3|4)} colors={colors} theme={theme}>
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

          {/* Custom Rules */}
          <CustomRulesSection
            customRules={customRules}
            selectedCustomRuleIds={selectedCustomRuleIds}
            theme={theme}
            onSelectedCustomRuleIdsChange={setSelectedCustomRuleIds}
            onCustomRulesChange={setCustomRules}
            onShowCustomRuleModal={() => {
              setNewCustomRuleTitle("");
              setNewCustomRuleDescription("");
              setNewCustomRuleType('multiplier');
              setNewCustomRuleValue("");
              setShowCustomRuleModal(true);
            }}
          />
        </>
      )}

      {/* Chinese Official Mode Controls */}
      {mode === "chineseOfficial" && (
        <ChineseOfficialModeControls
          inputMode={chineseOfficialInputMode}
          selectedFans={chineseOfficialSelectedFans}
          flowerCount={chineseOfficialFlowerCount}
          isSelfDraw={chineseOfficialIsSelfDraw}
          isConcealed={chineseOfficialIsConcealed}
          prevalentWindPung={chineseOfficialPrevalentWindPung}
          seatWindPung={chineseOfficialSeatWindPung}
          showFanModal={showChineseOfficialFanModal}
          hand={chineseOfficialHand}
          detectedFanIds={detectedFanIds}
          manualTiles={manualTiles}
          showTilePicker={showTilePicker}
          tileInputError={tileInputError}
          tileInputEngine={tileInputEngine}
          theme={theme}
          onInputModeChange={(mode) => {
            setChineseOfficialInputMode(mode);
            if (mode === 'fanSelection') {
              setUseOptimalSolver(false);
              setChineseOfficialHand(null);
            } else {
              setUseOptimalSolver(true);
            }
          }}
          onShowFanModalChange={setShowChineseOfficialFanModal}
          onSelectedFansChange={setChineseOfficialSelectedFans}
          onFlowerCountChange={setChineseOfficialFlowerCount}
          onIsSelfDrawChange={setChineseOfficialIsSelfDraw}
          onIsConcealedChange={setChineseOfficialIsConcealed}
          onPrevalentWindPungChange={setChineseOfficialPrevalentWindPung}
          onSeatWindPungChange={setChineseOfficialSeatWindPung}
          onHandChange={setChineseOfficialHand}
          onUseOptimalSolverChange={setUseOptimalSolver}
          onDetectedFanIdsChange={setDetectedFanIds}
          onManualTilesChange={setManualTiles}
          onShowTilePickerChange={setShowTilePicker}
          onTileInputErrorChange={setTileInputError}
        />
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
            {(result.rule.doublesApplied ?? 0) > 0 && (
              <Text style={styles.resultText(colors)}>
                Doubles applied: {result.rule.doublesApplied} (×{Math.pow(2, result.rule.doublesApplied ?? 0)} multiplier)
              </Text>
            )}
            {result.rule.eastDoubleApplied && (
              <Text style={styles.resultText(colors)}>East's Double: Applied (East pays/receives double)</Text>
            )}
            {selectedCustomRuleIds.size > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.resultText(colors)}>Custom Rules Applied:</Text>
                {Array.from(selectedCustomRuleIds).map(id => {
                  const rule = customRules.find(r => r.id === id);
                  if (!rule) return null;
                  return (
                    <Text key={id} style={[styles.resultText(colors), { marginLeft: 8, marginTop: 2 }]}>
                      • {rule.title}: {rule.type === 'multiplier' ? `×${rule.value}` : `+${rule.value} points`}
                    </Text>
                  );
                })}
              </View>
            )}

            {/* No-Exposures description */}
            {result.appliedNoExposureBonus && result.appliedNoExposureBonus.applied && (
              <Text style={[styles.resultText(colors), { marginTop: 4 }]}>
                No-Exposures bonus: {result.appliedNoExposureBonus.mode === "flat" ? "+" : "×"}{result.appliedNoExposureBonus.value}
              </Text>
            )}

            {/* Per-payer */}
            <View style={styles.paymentSection}>
              {/* Show individual payer breakdown when East's double is enabled and winner is not East */}
              {eastDouble && !isWinnerEast && Object.keys(result.payerMap || {}).length > 0 ? (
                <>
                  {(() => {
                    // Get all payer entries (excluding winner)
                    const allPayerEntries = Object.entries(result.payerMap || {})
                      .filter(([pid, amt]) => pid !== winnerId && amt > 0);
                    
                    // Find East entry - check for "E" or "East" in the payerMap keys
                    const eastEntry = allPayerEntries.find(([pid]) => 
                      pid === "E" || pid === "East"
                    );
                    
                    // Get other players (non-East)
                    const otherEntries = allPayerEntries.filter(([pid]) => 
                      pid !== "E" && pid !== "East"
                    );
                    
                    // Get the standard amount (from first other player, or calculate from East if needed)
                    const standardAmount = otherEntries.length > 0 
                      ? otherEntries[0][1] 
                      : (eastEntry ? eastEntry[1] / 2 : 0);
                    
                    return (
                      <>
                        {/* East pays section - always show if East is in payerMap */}
                        {eastEntry && (
                          <Text style={styles.paymentText(colors)}>
                            {displayMode === "currency"
                              ? `East pays: $${(eastEntry[1] / 100).toFixed(2)} (2× standard)`
                              : `East: -${eastEntry[1]} pts (2× standard)`}
                          </Text>
                        )}
                        
                        {/* Opponents pay section */}
                        {otherEntries.length > 0 && (
                          <Text style={styles.paymentText(colors)}>
                            {displayMode === "currency"
                              ? `Each opponent pays: $${(standardAmount / 100).toFixed(2)}`
                              : `Each opponent: -${standardAmount} pts`}
                          </Text>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <>
              {winType === "discard" ? (
                <>
                  <Text style={styles.paymentText(colors)}>
                        {displayMode === "currency" 
                          ? `Discarder pays: $${((result.perLoserAmounts.discarder ?? 0) / 100).toFixed(2)}`
                          : `Discarder: -${result.perLoserAmounts.discarder ?? 0} pts`}
                  </Text>
                  <Text style={styles.paymentText(colors)}>
                        {displayMode === "currency"
                          ? `Each other player pays: $${((result.perLoserAmounts.others ?? 0) / 100).toFixed(2)}`
                          : `Each opponent: -${result.perLoserAmounts.others ?? 0} pts`}
                  </Text>
                </>
              ) : (
                <Text style={styles.paymentText(colors)}>
                      {displayMode === "currency"
                        ? `Each opponent pays: $${((result.perLoserAmounts.others ?? 0) / 100).toFixed(2)}`
                        : `Each opponent: -${result.perLoserAmounts.others ?? 0} pts`}
                </Text>
              )}
                </>
              )}
              {(result.jokerlessPointsBonus ?? 0) > 0 && (
                <Text style={styles.resultText(colors)}>
                  Jokerless bonus: +{result.jokerlessPointsBonus} {displayMode === "currency" ? "cents" : "pts"}
                </Text>
              )}
              {(result.exposurePenalty ?? 0) > 0 && (
                <Text style={styles.resultText(colors)}>
                  Exposure penalty: -{result.exposurePenalty} {displayMode === "currency" ? "cents" : "pts"}
                </Text>
              )}
              <Text style={styles.totalText(colors, theme)}>
                Total to Winner: {displayMode === "currency"
                  ? `$${(result.totalToWinner / 100).toFixed(2)}`
                  : `${result.totalToWinner} pts`}
              </Text>
            </View>

            {/* Save Hand Section - Only for Standard Mode */}
            {mode === "standard" && (
              <>
                <StandardSaveHand
                  handName={handName}
                  basePoints={basePoints}
                  winType={winType}
                  jokerless={jokerless}
                  singlesAndPairs={singlesAndPairs}
                  noExposures={noExposures}
                  result={result}
                  displayMode={displayMode}
                  mode={mode}
                  standardWinnerExposureCount={standardWinnerExposureCount}
                  saveSuccess={saveSuccess}
                  theme={theme}
                  onSaveSuccess={setSaveSuccess}
                />
                
                {/* Clear Button */}
                <StandardClearButton
                  theme={theme}
                  onClear={() => {
                    // Reset all state variables
                    setBasePoints("0");
                    setWinType("self_pick");
                    setJokerless(false);
                    setSinglesAndPairs(false);
                    setMisnamedJoker(false);
                    setNoExposures(false);
                    setExposurePenaltyEnabled(false);
                    setExposurePenaltyPerExposure("5");
                    setStandardWinnerExposureCount("0");
                    setLastTileFromWall(false);
                    setLastTileClaim(false);
                    setRobbingTheJoker(false);
                    setEastDouble(false);
                    setIsWinnerEast(false);
                    setSelectedCategoryId("");
                    setSelectedHand("");
                    setHandName("");
                    setSelectedCustomRuleIds(new Set());
                    setCustomRuleValues({});
                    setDisplayMode("currency"); // Reset display format to money
                  }}
                />
              </>
            )}

            {/* Optional: show payer map if IDs were passed and not already shown in main breakdown */}
            {Object.keys(result.payerMap || {}).length > 0 && !(eastDouble && !isWinnerEast) && (
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
        ) : mode === "tournament" ? (
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

            {/* Clear Button for Tournament Mode */}
            {mode === "tournament" && (
              <TournamentClearButton
                theme={theme}
                onClear={() => {
                  // Reset all tournament state variables
                  setTournamentWinnerId("N");
                  setTournamentDiscarderId("W");
                  setSelfPick(true);
                  setWinnerExposureCount(0);
                  setIsWallGame(false);
                  setTimeExpired(false);
                  setDeadN(false);
                  setDeadE(false);
                  setDeadW(false);
                  setDeadS(false);
                  setWinType("self_pick");
                  setJokerless(false);
                  setNoExposures(false);
                  setExposurePenaltyEnabled(false);
                  setExposurePenaltyPerExposure("5");
                  setLastTileFromWall(false);
                  setLastTileClaim(false);
                  setRobbingTheJoker(false);
                  setSelectedCustomRuleIds(new Set());
                  setCustomRuleValues({});
                }}
              />
            )}
          </>
        ) : (
          <ChineseOfficialResultDisplay
            result={chineseOfficialResult}
            inputMode={chineseOfficialInputMode}
            hand={chineseOfficialHand}
            isSelfDraw={chineseOfficialIsSelfDraw}
            discarderId={discarderId}
            displayMode={displayMode}
            theme={theme}
            onClear={() => {
              // Reset all Chinese Official state variables
              setChineseOfficialSelectedFans(new Set());
              setChineseOfficialFlowerCount("0");
              setChineseOfficialIsSelfDraw(false);
              setChineseOfficialIsConcealed(false);
              setChineseOfficialPrevalentWindPung(false);
              setChineseOfficialSeatWindPung(false);
              setChineseOfficialHand(null);
              setChineseOfficialOptimalResult(null);
              setDetectedFanIds([]);
              setChineseOfficialInputMode('fanSelection');
              tileInputEngine.resetHand();
              const state = tileInputEngine.getState();
              setManualTiles(state.tiles);
              setTileInputError(null);
            }}
          />
        )}
      </View>
      </View>
    </ScrollView>

    {/* Settings Menu Modal - Slides from bottom */}
    <SettingsMenuModal
      visible={showThemeMenu}
      theme={theme}
      onClose={() => setShowThemeMenu(false)}
      onThemeChange={(newTheme) => setTheme(newTheme)}
      onPrivacyPolicyPress={() => setShowPrivacyPolicy(true)}
      onContactUsPress={() => setShowContactUs(true)}
    />

    {/* Privacy Policy Modal */}
    <Modal
      visible={showPrivacyPolicy}
      transparent={false}
      animationType="slide"
      onRequestClose={() => setShowPrivacyPolicy(false)}
    >
      <PrivacyPolicyScreen onClose={() => setShowPrivacyPolicy(false)} />
    </Modal>

    {/* Contact Us Modal */}
    <Modal
      visible={showContactUs}
      transparent={false}
      animationType="slide"
      onRequestClose={() => setShowContactUs(false)}
    >
      <ContactUsScreen onClose={() => setShowContactUs(false)} />
    </Modal>

    {/* Mode Selector Modal */}
    <ModeSelectorModal
      visible={showModeSelectorModal}
      currentMode={mode}
      theme={theme}
      onClose={() => setShowModeSelectorModal(false)}
      onSelectMode={(selectedMode) => {
        setMode(selectedMode);
        if (selectedMode === "standard") {
          setDisplayMode("currency"); // Reset display format to money when switching to standard
        }
      }}
    />

    {/* Category Selection Modal */}
    <CategorySelectionModal
      visible={showCategoryModal}
      selectedCategoryId={selectedCategoryId}
      theme={theme}
      onClose={() => setShowCategoryModal(false)}
      onSelectCategory={(categoryId) => {
        setSelectedCategoryId(categoryId);
      }}
    />

    {/* Hand Selection Modal */}
    <HandSelectionModal
      visible={showHandModal}
      selectedCategoryId={selectedCategoryId}
      selectedHand={selectedHand}
      availableHands={availableHands}
      theme={theme}
      onClose={() => setShowHandModal(false)}
      onSelectHand={(handNumber) => {
        setSelectedHand(handNumber);
      }}
    />

    {/* Custom Rule Modal */}
    <CustomRuleModal
      visible={showCustomRuleModal}
      title={newCustomRuleTitle}
      description={newCustomRuleDescription}
      type={newCustomRuleType}
      value={newCustomRuleValue}
      theme={theme}
      onClose={() => {
        setShowCustomRuleModal(false);
        setNewCustomRuleTitle("");
        setNewCustomRuleDescription("");
        setNewCustomRuleType('multiplier');
        setNewCustomRuleValue("");
      }}
      onTitleChange={setNewCustomRuleTitle}
      onDescriptionChange={setNewCustomRuleDescription}
      onTypeChange={setNewCustomRuleType}
      onValueChange={setNewCustomRuleValue}
      onSave={async (rule) => {
        await saveCustomRule(rule);
        const updatedRules = await getCustomRules();
        setCustomRules(updatedRules);
        setNewCustomRuleTitle("");
        setNewCustomRuleDescription("");
        setNewCustomRuleType('multiplier');
        setNewCustomRuleValue("");
        setShowCustomRuleModal(false);
      }}
    />

    {/* Edit Rule Modal */}
    <EditRuleModal
      visible={showEditRuleModal}
      editingRuleKey={editingRuleKey}
      editRuleType={editRuleType}
      editRuleValue={editRuleValue}
      theme={theme}
      onClose={() => setShowEditRuleModal(false)}
      onTypeChange={setEditRuleType}
      onValueChange={setEditRuleValue}
      onSave={handleSaveEditRule}
    />

    {/* Chinese Official Fan Selection Modal */}
    <ChineseOfficialFanSelectionModal
      visible={showChineseOfficialFanModal}
      onClose={() => setShowChineseOfficialFanModal(false)}
      selectedFans={chineseOfficialSelectedFans}
      onFansChange={setChineseOfficialSelectedFans}
      detectedFanIds={detectedFanIds}
      flowerCount={chineseOfficialFlowerCount}
      theme={theme}
    />
    </>
  );
}


