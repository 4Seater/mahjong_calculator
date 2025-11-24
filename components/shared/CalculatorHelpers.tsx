import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { styles } from '../ScoreCalculatorCard.styles';

export function Row({ children, style, colors }: any) {
  return <View style={[styles.row(colors), style]}>{children}</View>;
}

export function RowWithEdit({ children, style, colors, onEdit, editKey, disabled }: any) {
  return (
    <View style={[styles.row(colors), style]}>
      {children}
      {onEdit && (
        <TouchableOpacity
          onPress={disabled ? undefined : () => onEdit(editKey)}
          disabled={disabled}
          style={{ padding: 8, marginLeft: 8, opacity: disabled ? 0.3 : 1 }}
        >
          <FontAwesome5 name="edit" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export function Label({ children, sub, colors }: { children: React.ReactNode; sub?: string; colors: any }) {
  return (
    <View style={styles.labelContainer(colors)}>
      <Text style={styles.labelText(colors)}>{children}</Text>
      {sub ? <Text style={styles.labelSubtext(colors)}>{sub}</Text> : null}
    </View>
  );
}

export function Seg({ selected, onPress, children, colors, theme, disabled }: any) {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        styles.segButton(colors),
        selected ? styles.segButtonSelected(colors) : styles.segButtonUnselected(colors),
        disabled && { opacity: 0.5 }
      ]}
    >
      <Text style={[
        styles.segText(colors),
        selected ? styles.segTextSelected(colors, theme) : styles.segTextUnselected(colors)
      ]}>{children}</Text>
    </TouchableOpacity>
  );
}

