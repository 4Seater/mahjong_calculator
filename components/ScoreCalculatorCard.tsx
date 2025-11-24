import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, Switch } from "react-native";
import { styles } from "./ScoreCalculatorCard.styles";
import type { WinType, ScoreResult } from "@/lib/scoring/types";
import { Hand, Tile } from "@/lib/scoring/chineseOfficial/tiles";
import { TileInputEngine } from "@/lib/scoring/chineseOfficial/tileInputEngine";
import { useTheme } from "@/contexts/ThemeContext";
import { getColors } from "@/constants/colors";
import { FontAwesome5 } from '@expo/vector-icons';
import type { CustomRule } from "@/lib/storage/customRulesStorage";
import PrivacyPolicyScreen from "./PrivacyPolicyScreen";
import ContactUsScreen from "./ContactUsScreen";
import ChineseOfficialFanSelectionModal from "./modals/ChineseOfficialFanSelectionModal";
import { useTournamentResult } from "./modes/useTournamentResult";
import { useStandardResult } from "./modes/useStandardResult";
import StandardResultDisplay from "./modes/American/StandardResultDisplay";
import TournamentResultDisplay from "./modes/Tournament/TournamentResultDisplay";
import { useHandSelection } from "./modes/useHandSelection";
import { useCustomRules } from "./modes/useCustomRules";
import { useClearHandlers } from "./modes/useClearHandlers";
import ChineseOfficialModeControls from "./modes/Chinese/ChineseOfficialModeControls";
import { useChineseOfficialResult } from "./modes/Chinese/useChineseOfficialResult";
import ChineseOfficialResultDisplay from "./modes/Chinese/ChineseOfficialResultDisplay";
import StandardModeControls from "./modes/American/StandardModeControls";
import TournamentModeControls from "./modes/Tournament/TournamentModeControls";
import EditRuleModal from "./EditRuleModal";
import CustomRuleModal from "./modals/CustomRuleModal";
import HandSelectionModal from "./modals/HandSelectionModal";
import CategorySelectionModal from "./modals/CategorySelectionModal";
import ModeSelectorModal from "./modals/ModeSelectorModal";
import SettingsMenuModal from "./modals/SettingsMenuModal";
import { Row, Label, Seg, RowWithEdit } from "./shared/CalculatorHelpers";
import CalculatorHeader from "./CalculatorHeader";
import HandSelectionUI from "./HandSelectionUI";
import BasePointsInput from "./BasePointsInput";

type Mode = "standard" | "tournament" | "chineseOfficial";

type Props = {
  
  winnerId?: string;
  discarderId?: string;
  otherPlayerIds?: string[];
  defaultNumPlayers?: number; // default 4
  onComputed?: (v: ScoreResult) => void;
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
  
  // Wall Game and Kitty
  const [wallGame, setWallGame] = useState(false);
  const [kittyEnabled, setKittyEnabled] = useState(false);
  const [kittyPayout, setKittyPayout] = useState<string>("10");
  
  // Mode selection - default to standard
  const [mode, setMode] = useState<Mode>("standard");

  // Inputs
  const [basePoints, setBasePoints] = useState<string>("");
  const [winType, setWinType] = useState<WinType>("self_pick");
  const [jokerless, setJokerless] = useState(false);
  const [singlesAndPairs, setSinglesAndPairs] = useState(false);
  const [misnamedJoker, setMisnamedJoker] = useState(false);
  const [heavenlyHand, setHeavenlyHand] = useState(false);

  // Handler for misnamed joker: automatically switch to discard when enabled
  const handleMisnamedJokerChange = (value: boolean) => {
    setMisnamedJoker(value);
    if (value) {
      // Mis-named joker can only happen on discard, so switch win type to discard
      setWinType("discard");
    }
  };

  // Handler for heavenly hand: automatically switch to self-pick when enabled
  const handleHeavenlyHandChange = (value: boolean) => {
    setHeavenlyHand(value);
    if (value) {
      // Heavenly hand is always considered self-pick, so switch win type to self-pick
      setWinType("self_pick");
    }
  };

  // Handler for win type: automatically disable misnamed joker if switching to self-pick
  // and disable heavenly hand if switching to discard
  const handleWinTypeChange = (value: WinType) => {
    setWinType(value);
    if (value === "self_pick" && misnamedJoker) {
      // Mis-named joker can only happen on discard, so disable it if switching to self-pick
      setMisnamedJoker(false);
    }
    if (value === "discard" && heavenlyHand) {
      // Heavenly hand is always self-pick, so disable it if switching to discard
      setHeavenlyHand(false);
    }
  };

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
  const [isWinner, setIsWinner] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Hand selection using custom hook
  const {
    selectedCategoryId,
    setSelectedCategoryId,
    selectedHand,
    setSelectedHand,
    showCategoryModal,
    setShowCategoryModal,
    showHandModal,
    setShowHandModal,
    handName,
    setHandName,
    availableHands,
  } = useHandSelection();

  // Custom rules using custom hook
  const {
    customRules,
    setCustomRules,
    selectedCustomRuleIds,
    setSelectedCustomRuleIds,
    showCustomRuleModal,
    setShowCustomRuleModal,
    newCustomRuleTitle,
    setNewCustomRuleTitle,
    newCustomRuleDescription,
    setNewCustomRuleDescription,
    winnerBonusType,
    setWinnerBonusType,
    winnerBonusValue,
    setWinnerBonusValue,
    discarderPenaltyEnabled,
    setDiscarderPenaltyEnabled,
    discarderPenaltyType,
    setDiscarderPenaltyType,
    discarderPenaltyValue,
    setDiscarderPenaltyValue,
    allPlayerPenaltyEnabled,
    setAllPlayerPenaltyEnabled,
    allPlayerPenaltyType,
    setAllPlayerPenaltyType,
    allPlayerPenaltyValue,
    setAllPlayerPenaltyValue,
    showEditRuleModal,
    setShowEditRuleModal,
    editingRule,
    editingRuleKey,
    setEditingRuleKey,
    editRuleType,
    setEditRuleType,
    editRuleValue,
    setEditRuleValue,
    customRuleValues,
    setCustomRuleValues,
    handleEditRule,
    handleSaveEditRule,
    handleSaveCustomRule,
    handleCloseCustomRuleModal,
    handleOpenCustomRuleModal,
  } = useCustomRules();

  // Chinese Official mode state
  const [chineseOfficialSelectedFans, setChineseOfficialSelectedFans] = useState<Set<string>>(new Set());
  const [chineseOfficialFlowerCount, setChineseOfficialFlowerCount] = useState<string>("0");
  const [chineseOfficialIsSelfDraw, setChineseOfficialIsSelfDraw] = useState(false);
  const [chineseOfficialIsConcealed, setChineseOfficialIsConcealed] = useState(false);
  const [chineseOfficialPrevalentWindPung, setChineseOfficialPrevalentWindPung] = useState(false);
  const [chineseOfficialSeatWindPung, setChineseOfficialSeatWindPung] = useState(false);
  const [showChineseOfficialFanModal, setShowChineseOfficialFanModal] = useState(false);
  const [chineseOfficialHand, setChineseOfficialHand] = useState<Hand | null>(null);
  const [useOptimalSolver, setUseOptimalSolver] = useState(false);
  const [chineseOfficialInputMode, setChineseOfficialInputMode] = useState<'fanSelection' | 'tileInput'>('fanSelection');
  const [detectedFanIds, setDetectedFanIds] = useState<string[]>([]);
  
  // Manual tile input engine state
  const [tileInputEngine] = useState(() => new TileInputEngine());
  const [manualTiles, setManualTiles] = useState<Tile[]>([]);
  const [tileInputError, setTileInputError] = useState<string | null>(null);
  const [showTilePicker, setShowTilePicker] = useState(false);

  // Clear handlers using custom hook
  const { clearStandard, clearTournament, clearChineseOfficial } = useClearHandlers({
    setBasePoints,
    setWinType,
    setJokerless,
    setDisplayMode,
    setSinglesAndPairs,
    setMisnamedJoker,
    setHeavenlyHand,
    setWallGame,
    setKittyEnabled,
    setKittyPayout,
    setNoExposures,
    setExposurePenaltyEnabled,
    setExposurePenaltyPerExposure,
    setStandardWinnerExposureCount,
    setLastTileFromWall,
    setLastTileClaim,
    setRobbingTheJoker,
    setEastDouble,
    setIsWinnerEast,
    setSelectedCategoryId,
    setSelectedHand,
    setHandName,
    setSelectedCustomRuleIds,
    setCustomRuleValues,
    setTournamentWinnerId,
    setTournamentDiscarderId,
    setSelfPick,
    setWinnerExposureCount,
    setIsWallGame,
    setTimeExpired,
    setDeadN,
    setDeadE,
    setDeadW,
    setDeadS,
    setChineseOfficialSelectedFans,
    setChineseOfficialFlowerCount,
    setChineseOfficialIsSelfDraw,
    setChineseOfficialIsConcealed,
    setChineseOfficialPrevalentWindPung,
    setChineseOfficialSeatWindPung,
    setChineseOfficialHand,
    setDetectedFanIds,
    setChineseOfficialInputMode,
    setManualTiles,
    setTileInputError,
    tileInputEngine,
  });

  // Disable exposure penalty when no exposures is enabled
  useEffect(() => {
    if (noExposures && exposurePenaltyEnabled) {
      setExposurePenaltyEnabled(false);
    }
  }, [noExposures]);

  // Standard result calculation using custom hook
  const result = useStandardResult({
    basePoints,
    winType,
    jokerless,
    singlesAndPairs,
    numPlayers,
    noExposures,
    misnamedJoker,
    heavenlyHand,
    wallGame,
    kittyEnabled,
    kittyPayout,
    displayMode,
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
    customRuleValues,
  });

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
    // onOptimalResultChange is optional and not needed - result is returned from hook
    onDetectedFanIdsChange: setDetectedFanIds,
    onSelectedFansChange: setChineseOfficialSelectedFans,
  });

  useEffect(() => {
    onComputed?.(result);
  }, [result, onComputed]);

  // Set display format based on mode and sync wall game states
  useEffect(() => {
    if (mode === "tournament") {
      setDisplayMode("points");
      // Sync wall game state when switching to tournament mode
      if (wallGame && !isWallGame) {
        setIsWallGame(true);
      }
    } else if (mode === "standard") {
      setDisplayMode("currency");
      // Sync wall game state when switching to standard mode
      if (isWallGame && !wallGame) {
        setWallGame(true);
      }
    }
  }, [mode]);

  // Disable kitty when points mode is selected (no kitty in points mode)
  useEffect(() => {
    if (displayMode === "points" && (mode === "standard" || mode === "tournament")) {
      setKittyEnabled(false);
    }
  }, [displayMode, mode]);


  return (
    <>
      <ScrollView style={styles.scrollView(colors)} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container(colors)}>
          <CalculatorHeader
            theme={theme}
            onMenuPress={() => setShowThemeMenu(true)}
            onClose={onClose}
          />

        {/* Mode Selection - At the top */}
        <View style={styles.section}>
          <Label colors={colors}>Calculator Mode</Label>
          <TouchableOpacity
            style={styles.dropdownButton(colors)}
            onPress={() => setShowModeSelectorModal(true)}
          >
            <Text style={styles.dropdownText(colors)}>
              {mode === "standard" ? "American" : mode === "tournament" ? "Tournament" : "Chinese Official"}
            </Text>
            <FontAwesome5 name="chevron-down" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Currency/Points Selector - Only show for standard mode, tournament mode is always points */}
        {mode === "standard" && (
        <View style={styles.section}>
            <Label colors={colors}>Score format</Label>
          <Row style={{ justifyContent: "flex-start" }} colors={colors}>
              <Seg selected={displayMode === "currency"} onPress={() => setDisplayMode("currency")} colors={colors} theme={theme}>$$ (Money)</Seg>
              <Seg selected={displayMode === "points"} onPress={() => setDisplayMode("points")} colors={colors} theme={theme}>Points</Seg>
          </Row>
        </View>
        )}
        {/* Tournament mode always uses points - show as read-only */}
        {mode === "tournament" && (
        <View style={styles.section}>
            <Label colors={colors}>Score format</Label>
          <Row style={{ justifyContent: "flex-start" }} colors={colors}>
              <Text style={[styles.resultText(colors), { paddingVertical: 8, paddingHorizontal: 12 }]}>Points</Text>
          </Row>
        </View>
        )}

        {/* Wall Game - Only show for standard/tournament modes */}
        {mode !== "chineseOfficial" && (
        <View style={[styles.section, { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12 }]}>
          <RowWithEdit 
            colors={colors} 
            onEdit={undefined}
            editKey={null}
          >
            <View style={{ flex: 1 }}>
              <Label colors={colors} sub="No wins when the tiles run out">Wall Game</Label>
            </View>
            <Switch 
              value={mode === "tournament" ? isWallGame : wallGame} 
              onValueChange={(value) => {
                if (mode === "tournament") {
                  setIsWallGame(value);
                } else {
                  setWallGame(value);
                }
              }}
              trackColor={{ false: colors.border, true: colors.gobutton }}
              thumbColor={(mode === "tournament" ? isWallGame : wallGame) ? colors.card : colors.textSecondary}
            />
            {/* Invisible placeholder to align with other toggles */}
            <View style={{ padding: 8, marginLeft: 8, width: 30 }}>
              <FontAwesome5 name="edit" size={14} color="transparent" />
            </View>
          </RowWithEdit>
          
          {/* Kitty toggle - only appears when Wall Game is selected AND currency mode is selected (no kitty in points mode) */}
          {wallGame && displayMode === "currency" && (
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
              {/* Vertical line going down */}
              <View style={{ width: 20, alignItems: 'center', justifyContent: 'flex-start' }}>
                <View style={{ width: 1, height: 20, backgroundColor: colors.border }} />
              </View>
              {/* Horizontal line with arrow and Kitty on same line */}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                {/* Horizontal line */}
                <View style={{ width: 16, height: 1, backgroundColor: colors.border }} />
                {/* Arrow */}
                <FontAwesome5 name="arrow-right" size={12} color={colors.border} style={{ marginHorizontal: 4 }} />
                {/* Kitty option */}
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <RowWithEdit 
                    colors={colors} 
                    onEdit={() => handleEditRule('kitty', 'points', Number(kittyPayout || 10))}
                    editKey="kitty"
                  >
                    <View style={{ flex: 1, marginLeft: 0 }}>
                      <Label colors={colors} sub={`All players (including winner) pay ${customRuleValues.kitty?.value || kittyPayout || 10} ${displayMode === 'currency' ? 'cents' : 'points'} to the kitty. Winner of the next game is awarded the kitty in addition to their payout for that game.`}>
                        Kitty
                      </Label>
                    </View>
                    <Switch 
                      value={kittyEnabled} 
                      onValueChange={setKittyEnabled}
                      trackColor={{ false: colors.border, true: colors.gobutton }}
                      thumbColor={kittyEnabled ? colors.card : colors.textSecondary}
                    />
                  </RowWithEdit>
                </View>
              </View>
            </View>
          )}
        </View>
        )}

        {/* Standard/Tournament Mode Controls - Only show for standard/tournament */}
        {mode !== "chineseOfficial" && (
          <>
            {/* Hand Selection UI */}
            <HandSelectionUI
              selectedCategoryId={selectedCategoryId}
              selectedHand={selectedHand}
              availableHands={availableHands}
              showCategoryModal={showCategoryModal}
              showHandModal={showHandModal}
              theme={theme}
              wallGame={wallGame}
              onShowCategoryModal={() => setShowCategoryModal(true)}
              onShowHandModal={() => setShowHandModal(true)}
            />

        {/* Base points */}
        <BasePointsInput
          basePoints={basePoints}
          theme={theme}
          wallGame={wallGame}
          onBasePointsChange={setBasePoints}
        />

        {/* Standard Mode Controls */}
        {mode === "standard" && (
          <StandardModeControls
            wallGame={wallGame}
            winType={winType}
            jokerless={jokerless}
            misnamedJoker={misnamedJoker}
            heavenlyHand={heavenlyHand}
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
            onWinTypeChange={handleWinTypeChange}
            onJokerlessChange={setJokerless}
            onMisnamedJokerChange={handleMisnamedJokerChange}
            onHeavenlyHandChange={handleHeavenlyHandChange}
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
            onShowCustomRuleModal={handleOpenCustomRuleModal}
            onEditRule={handleEditRule}
          />
        )}
        </>
      )}

      {/* Tournament Mode Controls */}
      {mode === "tournament" && (
        <TournamentModeControls
          winType={winType}
          selfPick={selfPick}
          jokerless={jokerless}
          tournamentWinnerId={tournamentWinnerId}
          tournamentDiscarderId={tournamentDiscarderId}
          winnerExposureCount={winnerExposureCount}
          isWallGame={isWallGame}
          timeExpired={timeExpired}
          deadN={deadN}
          deadE={deadE}
          deadW={deadW}
          deadS={deadS}
          playerIds={playerIds}
          customRules={customRules}
          selectedCustomRuleIds={selectedCustomRuleIds}
          theme={theme}
          onWinTypeChange={setWinType}
          onSelfPickChange={setSelfPick}
          onJokerlessChange={setJokerless}
          onTournamentWinnerIdChange={setTournamentWinnerId}
          onTournamentDiscarderIdChange={setTournamentDiscarderId}
          onWinnerExposureCountChange={setWinnerExposureCount}
          onIsWallGameChange={setIsWallGame}
          onTimeExpiredChange={setTimeExpired}
          onDeadNChange={setDeadN}
          onDeadEChange={setDeadE}
          onDeadWChange={setDeadW}
          onDeadSChange={setDeadS}
          onSelectedCustomRuleIdsChange={setSelectedCustomRuleIds}
          onCustomRulesChange={setCustomRules}
          onShowCustomRuleModal={handleOpenCustomRuleModal}
        />
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
          <StandardResultDisplay
            result={result}
            winType={winType}
            displayMode={displayMode}
            theme={theme}
            eastDouble={eastDouble}
            isWinnerEast={isWinnerEast}
            winnerId={winnerId}
            selectedCustomRuleIds={selectedCustomRuleIds}
            customRules={customRules}
            handName={handName}
            basePoints={basePoints}
            jokerless={jokerless}
            singlesAndPairs={singlesAndPairs}
            noExposures={noExposures}
            standardWinnerExposureCount={standardWinnerExposureCount}
            wallGame={wallGame}
            kittyPayout={kittyEnabled ? Number(kittyPayout || 10) : undefined}
            saveSuccess={saveSuccess}
            onSaveSuccess={setSaveSuccess}
            onClear={clearStandard}
          />
        ) : mode === "tournament" ? (
          <TournamentResultDisplay
            result={tournamentResult}
            theme={theme}
            onClear={clearTournament}
          />
        ) : (
          <ChineseOfficialResultDisplay
            result={chineseOfficialResult}
            inputMode={chineseOfficialInputMode}
            hand={chineseOfficialHand}
            isSelfDraw={chineseOfficialIsSelfDraw}
            discarderId={discarderId}
            displayMode={displayMode}
            theme={theme}
            onClear={clearChineseOfficial}
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
      editingRule={editingRule}
      title={newCustomRuleTitle}
      description={newCustomRuleDescription}
      winnerBonusType={winnerBonusType}
      winnerBonusValue={winnerBonusValue}
      discarderPenaltyEnabled={discarderPenaltyEnabled}
      discarderPenaltyType={discarderPenaltyType}
      discarderPenaltyValue={discarderPenaltyValue}
      allPlayerPenaltyEnabled={allPlayerPenaltyEnabled}
      allPlayerPenaltyType={allPlayerPenaltyType}
      allPlayerPenaltyValue={allPlayerPenaltyValue}
      theme={theme}
      onClose={handleCloseCustomRuleModal}
      onTitleChange={setNewCustomRuleTitle}
      onDescriptionChange={setNewCustomRuleDescription}
      onWinnerBonusTypeChange={setWinnerBonusType}
      onWinnerBonusValueChange={setWinnerBonusValue}
      onDiscarderPenaltyEnabledChange={setDiscarderPenaltyEnabled}
      onDiscarderPenaltyTypeChange={setDiscarderPenaltyType}
      onDiscarderPenaltyValueChange={setDiscarderPenaltyValue}
      onAllPlayerPenaltyEnabledChange={setAllPlayerPenaltyEnabled}
      onAllPlayerPenaltyTypeChange={setAllPlayerPenaltyType}
      onAllPlayerPenaltyValueChange={setAllPlayerPenaltyValue}
      onSave={handleSaveCustomRule}
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


