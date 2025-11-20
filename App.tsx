import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ScoreCalculatorCard from './components/ScoreCalculatorCard';
import StatsScreen from './components/StatsScreen';
import { getColors } from './constants/colors';
import { FontAwesome5 } from '@expo/vector-icons';

type Screen = 'calculator' | 'stats';

function AppContent() {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const [currentScreen, setCurrentScreen] = useState<Screen>('calculator');
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  const handleScreenChange = (screen: Screen) => {
    setCurrentScreen(screen);
    if (screen === 'stats') {
      // Trigger refresh when navigating to stats
      setStatsRefreshTrigger(prev => prev + 1);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      
      {/* Tab Navigation */}
      <View style={styles.tabBar(colors)}>
        <TouchableOpacity
          style={[styles.tab(colors), currentScreen === 'calculator' && styles.tabActive(colors)]}
          onPress={() => handleScreenChange('calculator')}
        >
          <FontAwesome5 
            name="calculator" 
            size={20} 
            color={currentScreen === 'calculator' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText(colors), currentScreen === 'calculator' && styles.tabTextActive(colors)]}>
            Calculator
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab(colors), currentScreen === 'stats' && styles.tabActive(colors)]}
          onPress={() => handleScreenChange('stats')}
        >
          <FontAwesome5 
            name="chart-bar" 
            size={20} 
            color={currentScreen === 'stats' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText(colors), currentScreen === 'stats' && styles.tabTextActive(colors)]}>
            Statistics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Content */}
      {currentScreen === 'calculator' ? (
        <ScoreCalculatorCard />
      ) : (
        <StatsScreen refreshTrigger={statsRefreshTrigger} />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  tabBar: (colors: any) => ({
    flexDirection: 'row' as const,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  }),
  tab: (colors: any) => ({
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    gap: 8,
  }),
  tabActive: (colors: any) => ({
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  }),
  tabText: (colors: any) => ({
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  }),
  tabTextActive: (colors: any) => ({
    color: colors.primary,
    fontWeight: '700' as const,
  }),
};

