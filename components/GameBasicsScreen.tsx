import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/colors';

export default function GameBasicsScreen() {
  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <ScrollView 
      style={[styles.scrollView, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title(colors)}>American Mahjong Basics (Condensed)</Text>

        <View style={styles.section(colors)}>
          <Text style={styles.sectionTitle(colors)}>Tile & Table Basics</Text>
          <Text style={styles.text(colors)}>152 tiles total.</Text>
          <Text style={styles.text(colors)}>Direction of play: Counter-clockwise.</Text>
          <Text style={styles.text(colors)}>Number of tiles in a wall: 19 stacks per side, 2 tiles high → 38 tiles per wall.</Text>
          <Text style={styles.text(colors)}>Building walls: Each player builds a wall in front of them.</Text>
          <Text style={styles.text(colors)}>Breaking the wall: The dealer rolls dice and counts off that many stacks from the right end of their wall.</Text>
        </View>

        <View style={styles.section(colors)}>
          <Text style={styles.sectionTitle(colors)}>The Charleston (Condensed)</Text>
          <Text style={styles.text(colors)}>A structured tile-exchange that happens before play starts.</Text>
          <Text style={styles.text(colors)}>Pass 1 – Right</Text>
          <Text style={styles.text(colors, true)}>Pass 3 tiles to the right.</Text>
          <Text style={styles.text(colors)}>Pass 2 – Across</Text>
          <Text style={styles.text(colors, true)}>Pass 3 tiles to the player across</Text>
          <Text style={styles.text(colors)}>Pass 3 – left</Text>
        </View>

        <View style={styles.section(colors)}>
          <Text style={styles.sectionTitle(colors)}>Blind Pass Rule (Correct NMJL Rule)</Text>
          <Text style={styles.text(colors)}>A blind pass is ONLY allowed during Pass 3 (Across) if a player cannot find 3 tiles they want to give away.</Text>
          <Text style={styles.text(colors)}>You must still pass three tiles.</Text>
          <Text style={styles.text(colors)}>You may pass 1, 2, or all 3 blind (face-down without looking).</Text>
          <Text style={styles.text(colors)}>Blind passes are NOT allowed in Pass 1, Pass 2, or Courtesy Pass.</Text>
        </View>

        <View style={styles.section(colors)}>
          <Text style={styles.sectionTitle(colors)}>Optional Charleston (aka "Second Charleston")</Text>
          <Text style={styles.text(colors)}>Players vote unanimously before starting:</Text>
          <Text style={styles.text(colors)}>If everyone agrees, continue with:</Text>
          <Text style={styles.text(colors, true)}>Second Left</Text>
          <Text style={styles.text(colors, true)}>Across</Text>
          <Text style={styles.text(colors, true)}>Last right</Text>
          <Text style={styles.text(colors)}>If even one player says no, the optional Charleston is skipped entirely.</Text>
        </View>

        <View style={styles.section(colors)}>
          <Text style={styles.sectionTitle(colors)}>Courtesy Pass</Text>
          <Text style={styles.text(colors)}>After the Charleston(s):</Text>
          <Text style={styles.text(colors)}>A player may request 0–3 tiles from the player across.</Text>
          <Text style={styles.text(colors)}>Across player may pass 0–3 tiles back.</Text>
        </View>

        <View style={styles.section(colors)}>
          <Text style={styles.sectionTitle(colors)}>Gameplay Turns</Text>
          <Text style={styles.text(colors)}>Counterclockwise around the table.</Text>
          <Text style={styles.text(colors)}>This means after East, the next player is North, then West, then South, and back to East.</Text>
        </View>

        <View style={styles.section(colors)}>
          <Text style={styles.sectionTitle(colors)}>Wall Push-out / Dealing Tiles</Text>
          <Text style={styles.text(colors)}>Clockwise from the East seat.</Text>
          <Text style={styles.text(colors)}>This means when breaking the wall, the action moves 
            <Text style={styles.text(colors, true)}>East → South → West → North → East.</Text></Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = {
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  container: {
    flex: 1,
  },
  title: (colors: any) => ({
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center' as const,
  }),
  section: (colors: any) => ({
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  }),
  sectionTitle: (colors: any) => ({
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 12,
  }),
  text: (colors: any, indent: boolean = false) => ({
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 22,
    marginLeft: indent ? 16 : 0,
  }),
};

