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
import { getCustomRules, saveCustomRule, deleteCustomRule, type CustomRule } from "@/lib/storage/customRulesStorage";

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
      customRules: Array.from(selectedCustomRuleIds).map(id => {
        const rule = customRules.find(r => r.id === id);
        return rule ? { id: rule.id, type: rule.type, value: rule.value } : null;
      }).filter(Boolean) as Array<{ id: string; type: 'multiplier' | 'points'; value: number }>
    });
  }, [
    mode, basePoints, winType, tournamentWinnerId, tournamentDiscarderId,
    selfPick, jokerless, singlesAndPairs, winnerExposureCount,
    isWallGame, timeExpired, deadN, deadE, deadW, deadS,
    selectedCustomRuleIds, customRules
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
              <Text style={styles.headerTitle(colors)}>Mahjong Score Calculator</Text>
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
            <Seg selected={displayMode === "currency"} onPress={() => setDisplayMode("currency")} colors={colors} theme={theme}>$$ (Money)</Seg>
            <Seg selected={displayMode === "points"} onPress={() => setDisplayMode("points")} colors={colors} theme={theme}>Points</Seg>
          </Row>
        </View>

        {/* Mode Selection */}
        <View style={styles.section}>
          <Label colors={colors}>Calculator Mode</Label>
          <Row style={{ justifyContent: "flex-start" }} colors={colors}>
            <Seg selected={mode === "standard"} onPress={() => setMode("standard")} colors={colors} theme={theme}>Standard (NMJL)</Seg>
            <Seg selected={mode === "tournament"} onPress={() => setMode("tournament")} colors={colors} theme={theme}>Tournament</Seg>
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
          <>

      {/* Win Type */}
      <View style={{ marginTop: 4 }}>
        <Label colors={colors}>Win Type</Label>
        <Row style={{ justifyContent: "flex-start" }} colors={colors}>
          <Seg selected={winType === "self_pick"} onPress={() => setWinType("self_pick")} colors={colors} theme={theme}>Self-Pick</Seg>
          <Seg selected={winType === "discard"} onPress={() => setWinType("discard")} colors={colors} theme={theme}>From Discard</Seg>
        </Row>
      </View>

      {/* Standard Rules */}
      <View style={{ marginTop: 8, paddingTop: 8, borderTopColor: colors.border, borderTopWidth: 1 }}>
        {/* Jokerless */}
        <RowWithEdit 
          colors={colors} 
          onEdit={() => handleEditRule('jokerless', 'multiplier', 2)}
          editKey="jokerless"
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub={`No jokers anywhere in the hand (${customRuleValues.jokerless?.type === 'points' ? '+' : '×'}${customRuleValues.jokerless?.value || 2}).`}>
              Jokerless
            </Label>
          </View>
          <Switch 
            value={jokerless} 
            onValueChange={setJokerless}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={jokerless ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>

        {/* Mis-named Joker */}
        <RowWithEdit 
          colors={colors} 
          onEdit={() => handleEditRule('misnamedJoker', 'multiplier', 4)}
          editKey="misnamedJoker"
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub={`If a joker is discarded and mis-named, it may be called for mahjong. The multiplier is ${customRuleValues.misnamedJoker?.value || 4}× to the discarder.`}>
              Mis-named Joker
            </Label>
          </View>
          <Switch 
            value={misnamedJoker} 
            onValueChange={setMisnamedJoker}
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
            onEdit={() => handleEditRule('noExposures', 'multiplier', 2)}
            editKey="noExposures"
          >
            <View style={{ flex: 1 }}>
              <Label colors={colors} sub="Award for a fully concealed win">
                No Exposures (Fully Concealed)
              </Label>
            </View>
            <Switch 
              value={noExposures} 
              onValueChange={setNoExposures}
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
              onValueChange={setExposurePenaltyEnabled}
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
                  onChangeText={setStandardWinnerExposureCount}
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
                  onChangeText={setExposurePenaltyPerExposure}
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
          onEdit={() => handleEditRule('lastTileFromWall', 'multiplier', 2)}
          editKey="lastTileFromWall"
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub="Last tile taken from wall">Last Tile from Wall</Label>
          </View>
          <Switch 
            value={lastTileFromWall} 
            onValueChange={setLastTileFromWall}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={lastTileFromWall ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>

        <RowWithEdit 
          colors={colors} 
          onEdit={() => handleEditRule('lastTileClaim', 'multiplier', 2)}
          editKey="lastTileClaim"
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub="Last tile discarded in the game">Last Tile Claim</Label>
          </View>
          <Switch 
            value={lastTileClaim} 
            onValueChange={setLastTileClaim}
            trackColor={{ false: colors.border, true: colors.gobutton }}
            thumbColor={lastTileClaim ? colors.card : colors.textSecondary}
          />
        </RowWithEdit>

        <RowWithEdit 
          colors={colors} 
          onEdit={() => handleEditRule('robbingTheJoker', 'multiplier', 2)}
          editKey="robbingTheJoker"
        >
          <View style={{ flex: 1 }}>
            <Label colors={colors} sub="Robbing a joker from a player's exposure for Mah Jongg">Robbing the Joker</Label>
          </View>
          <Switch 
            value={robbingTheJoker} 
            onValueChange={setRobbingTheJoker}
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
            onValueChange={setEastDouble}
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
                onValueChange={setIsWinnerEast}
                trackColor={{ false: colors.border, true: colors.gobutton }}
                thumbColor={isWinnerEast ? colors.card : colors.textSecondary}
              />
            </Row>
          </View>
        )}

        {/* Custom Rules */}
        <View style={{ marginTop: 16, paddingTop: 16, borderTopColor: colors.border, borderTopWidth: 1 }}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Label colors={colors}>Custom Rules</Label>
          </View>

          {customRules.map((rule) => (
            <View key={rule.id} style={{ marginBottom: 12, padding: 12, backgroundColor: colors.inputBackground, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
              <Row colors={colors}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.labelText(colors)}>{rule.title}</Text>
                  {rule.description && (
                    <Text style={[styles.labelSubtext(colors), { marginTop: 4 }]}>{rule.description}</Text>
                  )}
                  <Text style={[styles.labelSubtext(colors), { marginTop: 2 }]}>
                    {rule.type === 'multiplier' ? `×${rule.value}` : `+${rule.value} points`}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Switch 
                    value={selectedCustomRuleIds.has(rule.id)} 
                    onValueChange={(enabled) => {
                      const newSet = new Set(selectedCustomRuleIds);
                      if (enabled) {
                        newSet.add(rule.id);
                      } else {
                        newSet.delete(rule.id);
                      }
                      setSelectedCustomRuleIds(newSet);
                    }}
                    trackColor={{ false: colors.border, true: colors.gobutton }}
                    thumbColor={selectedCustomRuleIds.has(rule.id) ? colors.card : colors.textSecondary}
                  />
                  <TouchableOpacity
                    onPress={async () => {
                      Alert.alert(
                        "Delete Custom Rule",
                        `Are you sure you want to delete "${rule.title}"?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: async () => {
                              await deleteCustomRule(rule.id);
                              const updatedRules = await getCustomRules();
                              setCustomRules(updatedRules);
                              const newSet = new Set(selectedCustomRuleIds);
                              newSet.delete(rule.id);
                              setSelectedCustomRuleIds(newSet);
                            }
                          }
                        ]
                      );
                    }}
                    style={{ padding: 8 }}
                  >
                    <FontAwesome5 name="trash" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </Row>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => {
              setNewCustomRuleTitle("");
              setNewCustomRuleDescription("");
              setNewCustomRuleType('multiplier');
              setNewCustomRuleValue("");
              setShowCustomRuleModal(true);
            }}
            style={[styles.addButton(colors), { marginTop: 8 }]}
          >
            <FontAwesome5 name="plus" size={16} color={colors.card} style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText(colors, theme)}>Add Custom Rule</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Players */}
      <View style={{ marginTop: 8 }}>
        <Label colors={colors}>Players</Label>
        <Row style={{ justifyContent: "flex-start" }} colors={colors}>
          {[2, 3, 4].map((n) => (
            <Seg key={n} selected={numPlayers === n} onPress={() => setNumPlayers(n)} colors={colors} theme={theme}>
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
          <View style={{ marginTop: 16, paddingTop: 16, borderTopColor: colors.border, borderTopWidth: 1 }}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Label colors={colors}>Custom Rules</Label>
            </View>

            {customRules.map((rule) => (
              <View key={rule.id} style={{ marginBottom: 12, padding: 12, backgroundColor: colors.inputBackground, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                <Row colors={colors}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.labelText(colors)}>{rule.title}</Text>
                    {rule.description && (
                      <Text style={[styles.labelSubtext(colors), { marginTop: 4 }]}>{rule.description}</Text>
                    )}
                    <Text style={[styles.labelSubtext(colors), { marginTop: 2 }]}>
                      {rule.type === 'multiplier' ? `×${rule.value}` : `+${rule.value} points`}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Switch 
                      value={selectedCustomRuleIds.has(rule.id)} 
                      onValueChange={(enabled) => {
                        const newSet = new Set(selectedCustomRuleIds);
                        if (enabled) {
                          newSet.add(rule.id);
                        } else {
                          newSet.delete(rule.id);
                        }
                        setSelectedCustomRuleIds(newSet);
                      }}
                      trackColor={{ false: colors.border, true: colors.gobutton }}
                      thumbColor={selectedCustomRuleIds.has(rule.id) ? colors.card : colors.textSecondary}
                    />
                    <TouchableOpacity
                      onPress={async () => {
                        Alert.alert(
                          "Delete Custom Rule",
                          `Are you sure you want to delete "${rule.title}"?`,
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: async () => {
                                await deleteCustomRule(rule.id);
                                const updatedRules = await getCustomRules();
                                setCustomRules(updatedRules);
                                const newSet = new Set(selectedCustomRuleIds);
                                newSet.delete(rule.id);
                                setSelectedCustomRuleIds(newSet);
                              }
                            }
                          ]
                        );
                      }}
                      style={{ padding: 8 }}
                    >
                      <FontAwesome5 name="trash" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </Row>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => {
                setNewCustomRuleTitle("");
                setNewCustomRuleDescription("");
                setNewCustomRuleType('multiplier');
                setNewCustomRuleValue("");
                setShowCustomRuleModal(true);
              }}
              style={[styles.addButton(colors), { marginTop: 8 }]}
            >
              <FontAwesome5 name="plus" size={16} color={colors.card} style={{ marginRight: 8 }} />
              <Text style={styles.addButtonText(colors, theme)}>+ Custom Rule</Text>
            </TouchableOpacity>
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
              <View style={[styles.resultsSection(colors), { marginTop: 20 }]}>
                <TouchableOpacity
                  style={[styles.saveButton(colors), saveSuccess && styles.saveButtonSuccess(colors)]}
                  onPress={async () => {
                    try {
                      const handToSave: SavedHand = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        timestamp: Date.now(),
                        handName: handName.trim() || "Custom Hand",
                        basePoints: Number(basePoints || 0),
                        winType,
                        jokerless,
                        singlesAndPairs,
                        noExposures,
                        totalToWinner: result.totalToWinner,
                        displayMode,
                        mode,
                        exposurePenalty: result.exposurePenalty,
                        winnerExposureCount: Number(standardWinnerExposureCount || 0),
                        perLoserAmounts: result.perLoserAmounts,
                        isWinner: true, // All saved hands are wins for the user
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
                  <Text style={styles.saveButtonText(colors, theme)}>
                    {saveSuccess ? "Saved!" : "Save Hand"}
                  </Text>
                </TouchableOpacity>
              </View>
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

    {/* Custom Rule Modal */}
    <Modal
      visible={showCustomRuleModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCustomRuleModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlayBottom(colors)}
        activeOpacity={1}
        onPress={() => setShowCustomRuleModal(false)}
      >
        <View style={styles.modalContent(colors)}>
          <View style={styles.modalHeader(colors)}>
            <Text style={styles.modalTitle(colors)}>Add Custom Rule</Text>
            <TouchableOpacity onPress={() => setShowCustomRuleModal(false)}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} contentContainerStyle={{ padding: 16 }}>
            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Title</Label>
              <TextInput
                value={newCustomRuleTitle}
                onChangeText={setNewCustomRuleTitle}
                placeholder="e.g., Special Bonus"
                placeholderTextColor={colors.textSecondary}
                style={styles.textInput(colors)}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Description</Label>
              <TextInput
                value={newCustomRuleDescription}
                onChangeText={setNewCustomRuleDescription}
                placeholder="Optional description"
                placeholderTextColor={colors.textSecondary}
                style={[styles.textInput(colors), { minHeight: 80, textAlignVertical: 'top' }]}
                multiline
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Type</Label>
              <Row style={{ justifyContent: "flex-start" }} colors={colors}>
                <Seg 
                  selected={newCustomRuleType === "multiplier"} 
                  onPress={() => setNewCustomRuleType("multiplier")} 
                  colors={colors}
                  theme={theme}
                >
                  Multiplier (×)
                </Seg>
                <Seg 
                  selected={newCustomRuleType === "points"} 
                  onPress={() => setNewCustomRuleType("points")} 
                  colors={colors}
                  theme={theme}
                >
                  Points (+)
                </Seg>
              </Row>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>
                {newCustomRuleType === "multiplier" ? "Multiplier Value" : "Points Value"}
              </Label>
              <TextInput
                keyboardType="decimal-pad"
                value={newCustomRuleValue}
                onChangeText={setNewCustomRuleValue}
                placeholder={newCustomRuleType === "multiplier" ? "e.g., 2" : "e.g., 10"}
                placeholderTextColor={colors.textSecondary}
                style={styles.textInput(colors)}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton(colors), { marginTop: 8 }]}
              onPress={async () => {
                if (!newCustomRuleTitle.trim()) {
                  Alert.alert("Error", "Please enter a title for the custom rule.");
                  return;
                }
                if (!newCustomRuleValue || Number(newCustomRuleValue) <= 0) {
                  Alert.alert("Error", "Please enter a valid value greater than 0.");
                  return;
                }

                const newRule: CustomRule = {
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  title: newCustomRuleTitle.trim(),
                  description: newCustomRuleDescription.trim(),
                  type: newCustomRuleType,
                  value: Number(newCustomRuleValue),
                  createdAt: Date.now()
                };

                await saveCustomRule(newRule);
                const updatedRules = await getCustomRules();
                setCustomRules(updatedRules);
                setNewCustomRuleTitle("");
                setNewCustomRuleDescription("");
                setNewCustomRuleType('multiplier');
                setNewCustomRuleValue("");
                setShowCustomRuleModal(false);
              }}
            >
              <FontAwesome5 name="save" size={16} color={colors.card} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText(colors, theme)}>Save Custom Rule</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>

    {/* Edit Rule Modal */}
    <Modal
      visible={showEditRuleModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowEditRuleModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlayBottom(colors)}
        activeOpacity={1}
        onPress={() => setShowEditRuleModal(false)}
      >
        <View style={styles.modalContent(colors)}>
          <View style={styles.modalHeader(colors)}>
            <Text style={styles.modalTitle(colors)}>
              Edit {editingRuleKey === 'jokerless' ? 'Jokerless' :
                    editingRuleKey === 'misnamedJoker' ? 'Mis-named Joker' :
                    editingRuleKey === 'lastTileFromWall' ? 'Last Tile from Wall' :
                    editingRuleKey === 'lastTileClaim' ? 'Last Tile Claim' :
                    editingRuleKey === 'robbingTheJoker' ? 'Robbing the Joker' :
                    editingRuleKey === 'noExposures' ? 'No Exposures (Fully Concealed)' : 'Rule'}
            </Text>
            <TouchableOpacity onPress={() => setShowEditRuleModal(false)}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} contentContainerStyle={{ padding: 16 }}>
            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>Type</Label>
              <Row style={{ justifyContent: "flex-start" }} colors={colors}>
                <Seg 
                  selected={editRuleType === "multiplier"} 
                  onPress={() => setEditRuleType("multiplier")} 
                  colors={colors}
                  theme={theme}
                >
                  Multiplier (×)
                </Seg>
                <Seg 
                  selected={editRuleType === "points"} 
                  onPress={() => setEditRuleType("points")} 
                  colors={colors}
                  theme={theme}
                >
                  Points (+)
                </Seg>
              </Row>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label colors={colors}>{editRuleType === "multiplier" ? "Multiplier Value" : "Points Value"}</Label>
              <TextInput
                keyboardType="decimal-pad"
                value={editRuleValue}
                onChangeText={setEditRuleValue}
                placeholder={editRuleType === "multiplier" ? "e.g., 2" : "e.g., 10"}
                placeholderTextColor={colors.textSecondary}
                style={styles.textInput(colors)}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton(colors), { marginTop: 8 }]}
              onPress={handleSaveEditRule}
            >
              <FontAwesome5 name="save" size={16} color={colors.card} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText(colors, theme)}>Save</Text>
            </TouchableOpacity>
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
  segTextSelected: (colors: any, theme?: 'light' | 'dark') => ({
    fontWeight: '700' as const,
    color: theme === 'dark' ? '#FFFFFF' : colors.primary, // Brighter white for dark mode contrast
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
  totalText: (colors: any, theme?: 'light' | 'dark') => ({
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 8,
    color: theme === 'dark' ? '#FFFFFF' : colors.primary, // White for high contrast in dark mode
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
  saveButtonText: (colors: any, theme?: 'light' | 'dark') => ({
    color: theme === 'dark' ? '#FFFFFF' : colors.card, // White text in dark mode
    fontSize: 16,
    fontWeight: '700' as const,
  }),
  addButton: (colors: any) => ({
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }),
  addButtonText: (colors: any, theme?: 'light' | 'dark') => ({
    color: theme === 'dark' ? '#FFFFFF' : colors.card, // White text in dark mode
    fontSize: 16,
    fontWeight: '600' as const,
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

