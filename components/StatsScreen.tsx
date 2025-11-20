import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/colors';
import { getSavedHands, deleteHand, clearAllHands } from '@/lib/storage/handStorage';
import { SavedHand } from '@/lib/types/game';
import { calculateStats } from '@/lib/utils/stats';
import { FontAwesome5 } from '@expo/vector-icons';

interface StatsScreenProps {
  refreshTrigger?: number;
}

export default function StatsScreen({ refreshTrigger }: StatsScreenProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const [hands, setHands] = useState<SavedHand[]>([]);
  const [stats, setStats] = useState(calculateStats([]));
  const [refreshing, setRefreshing] = useState(false);

  const loadHands = async () => {
    try {
      const savedHands = await getSavedHands();
      setHands(savedHands);
      setStats(calculateStats(savedHands));
    } catch (error) {
      console.error('Error loading hands:', error);
    }
  };

  useEffect(() => {
    loadHands();
  }, []);

  // Refresh when refreshTrigger changes (when navigating to this screen)
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadHands();
    }
  }, [refreshTrigger]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHands();
    setRefreshing(false);
  };

  const handleDelete = async (handId: string) => {
    Alert.alert(
      "Delete Hand",
      "Are you sure you want to delete this hand?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHand(handId);
              await loadHands();
            } catch (error) {
              Alert.alert("Error", "Failed to delete hand.");
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all saved hands? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllHands();
              await loadHands();
            } catch (error) {
              Alert.alert("Error", "Failed to clear history.");
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatAmount = (amount: number, displayMode: "currency" | "points") => {
    return displayMode === "currency" 
      ? `$${(amount / 100).toFixed(2)}`
      : `${amount} pts`;
  };

  // Get top favorite hands
  const topHands = Object.entries(stats.favoriteHands)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <ScrollView 
      style={styles.scrollView(colors)} 
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.container(colors)}>
        <Text style={styles.title(colors)}>Your Statistics</Text>

        {/* Stats Overview */}
        <View style={styles.statsCard(colors)}>
          <Text style={styles.cardTitle(colors)}>Overview</Text>
          <View style={styles.statRow(colors)}>
            <Text style={styles.statLabel(colors)}>Total Hands Played:</Text>
            <Text style={styles.statValue(colors)}>{stats.totalHands}</Text>
          </View>
          <View style={styles.statRow(colors)}>
            <Text style={styles.statLabel(colors)}>Total Wins:</Text>
            <Text style={styles.statValue(colors)}>{stats.totalWins}</Text>
          </View>
          <View style={styles.statRow(colors)}>
            <Text style={styles.statLabel(colors)}>Win Rate:</Text>
            <Text style={styles.statValue(colors)}>
              {stats.totalHands > 0 ? ((stats.totalWins / stats.totalHands) * 100).toFixed(1) : 0}%
            </Text>
          </View>
          <View style={styles.statRow(colors)}>
            <Text style={styles.statLabel(colors)}>Total Earnings:</Text>
            <Text style={styles.statValue(colors)}>
              {hands.length > 0 ? formatAmount(stats.totalEarnings, hands[0].displayMode) : '0'}
            </Text>
          </View>
          <View style={styles.statRow(colors)}>
            <Text style={styles.statLabel(colors)}>Average Win Value:</Text>
            <Text style={styles.statValue(colors)}>
              {stats.averageHandValue > 0 
                ? (hands.length > 0 ? formatAmount(stats.averageHandValue, hands[0].displayMode) : '0')
                : '0'}
            </Text>
          </View>
        </View>

        {/* Hand Type Stats */}
        <View style={styles.statsCard(colors)}>
          <Text style={styles.cardTitle(colors)}>Hand Types</Text>
          <View style={styles.statRow(colors)}>
            <Text style={styles.statLabel(colors)}>Jokerless Hands:</Text>
            <Text style={styles.statValue(colors)}>{stats.jokerlessCount}</Text>
          </View>
          <View style={styles.statRow(colors)}>
            <Text style={styles.statLabel(colors)}>Self-Pick Wins:</Text>
            <Text style={styles.statValue(colors)}>{stats.selfPickCount}</Text>
          </View>
          <View style={styles.statRow(colors)}>
            <Text style={styles.statLabel(colors)}>Discard Wins:</Text>
            <Text style={styles.statValue(colors)}>{stats.discardWinCount}</Text>
          </View>
        </View>

        {/* Favorite Hands */}
        {topHands.length > 0 && (
          <View style={styles.statsCard(colors)}>
            <Text style={styles.cardTitle(colors)}>Favorite Hands</Text>
            {topHands.map(([handName, count]) => (
              <View key={handName} style={styles.statRow(colors)}>
                <Text style={styles.statLabel(colors)}>{handName}:</Text>
                <Text style={styles.statValue(colors)}>{count} {count === 1 ? 'time' : 'times'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Hand History */}
        <View style={styles.historySection(colors)}>
          <View style={styles.historyHeader(colors)}>
            <Text style={styles.cardTitle(colors)}>Hand History</Text>
            {hands.length > 0 && (
              <TouchableOpacity onPress={handleClearAll} style={styles.clearButton(colors)}>
                <Text style={styles.clearButtonText(colors)}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          {hands.length === 0 ? (
            <Text style={styles.emptyText(colors)}>No hands saved yet. Save a hand from the calculator to see it here.</Text>
          ) : (
            hands.slice().reverse().map((hand) => (
              <View key={hand.id} style={styles.handCard(colors)}>
                <View style={styles.handHeader(colors)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.handName(colors)}>{hand.handName || 'Unnamed Hand'}</Text>
                    <Text style={styles.handDate(colors)}>{formatDate(hand.timestamp)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(hand.id)}
                    style={styles.deleteButton(colors)}
                  >
                    <FontAwesome5 name="trash" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.handDetails(colors)}>
                  <Text style={styles.handDetailText(colors)}>
                    Base: {hand.basePoints} | {hand.winType === 'self_pick' ? 'Self-Pick' : 'Discard'}
                    {hand.jokerless && ' | Jokerless'}
                    {hand.isWinner && (
                      <Text style={{ color: '#4CAF50', fontWeight: '700' }}> ✓ WIN</Text>
                    )}
                  </Text>
                  <Text style={styles.handValue(colors)}>
                    Value: {formatAmount(hand.totalToWinner, hand.displayMode)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
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
    gap: 16,
  }),
  title: (colors: any) => ({
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  }),
  statsCard: (colors: any) => ({
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  }),
  cardTitle: (colors: any) => ({
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  }),
  statRow: (colors: any) => ({
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  }),
  statLabel: (colors: any) => ({
    fontSize: 14,
    color: colors.textSecondary,
  }),
  statValue: (colors: any) => ({
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  }),
  historySection: (colors: any) => ({
    marginTop: 8,
  }),
  historyHeader: (colors: any) => ({
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  }),
  clearButton: (colors: any) => ({
    paddingHorizontal: 12,
    paddingVertical: 6,
  }),
  clearButtonText: (colors: any) => ({
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600' as const,
  }),
  emptyText: (colors: any) => ({
    textAlign: 'center' as const,
    color: colors.textSecondary,
    fontSize: 14,
    padding: 20,
  }),
  handCard: (colors: any) => ({
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  }),
  handHeader: (colors: any) => ({
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 8,
  }),
  handName: (colors: any) => ({
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  }),
  handDate: (colors: any) => ({
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  }),
  deleteButton: (colors: any) => ({
    padding: 8,
  }),
  handDetails: (colors: any) => ({
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  }),
  handDetailText: (colors: any) => ({
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  }),
  handValue: (colors: any) => ({
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primary,
  }),
};

