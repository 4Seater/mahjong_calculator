import React from 'react';
import { View, Text } from 'react-native';
import { getColors } from '@/constants/colors';
import { styles } from '../../ScoreCalculatorCard.styles';
import type { TournamentResult } from '@/lib/scoring/types';
import TournamentClearButton from './TournamentClearButton';

interface TournamentResultDisplayProps {
  result: TournamentResult | null;
  theme: 'light' | 'dark';
  onClear: () => void;
}

export default function TournamentResultDisplay({
  result,
  theme,
  onClear,
}: TournamentResultDisplayProps) {
  const colors = getColors(theme);

  return (
    <>
      <Text style={styles.resultsTitle(colors)}>Tournament Points</Text>
      {result && (
        <>
          {Object.entries(result.pointsByPlayer).map(([pid, pts]) => (
            <Text key={pid} style={styles.resultText(colors)}>
              {pid}: {pts >= 0 ? `+${pts}` : pts}
            </Text>
          ))}
          <View style={{ marginTop: 8 }}>
            {result.breakdown.map((line, i) => (
              <Text key={i} style={[styles.resultText(colors), { color: colors.textSecondary }]}>• {line}</Text>
            ))}
          </View>
        </>
      )}

      {/* Clear Button for Tournament Mode */}
      <TournamentClearButton
        theme={theme}
        onClear={onClear}
      />
    </>
  );
}

