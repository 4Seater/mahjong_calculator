import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from './ScoreCalculatorCard.styles';

interface CalculatorHeaderProps {
  theme: 'light' | 'dark';
  onMenuPress: () => void;
  onClose?: () => void;
}

export default function CalculatorHeader({
  theme,
  onMenuPress,
  onClose,
}: CalculatorHeaderProps) {
  const colors = getColors(theme);

  return (
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
        onPress={onMenuPress} 
        style={styles.menuButton}
      >
        <FontAwesome5 name="ellipsis-v" size={20} color={colors.card} />
      </TouchableOpacity>
    </View>
  );
}

