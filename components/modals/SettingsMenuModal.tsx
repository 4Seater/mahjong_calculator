import React from 'react';
import { View, Text, TouchableOpacity, Switch, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getColors } from '@/constants/colors';
import { styles } from '../ScoreCalculatorCard.styles';

interface SettingsMenuModalProps {
  visible: boolean;
  theme: 'light' | 'dark';
  onClose: () => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onPrivacyPolicyPress: () => void;
  onContactUsPress: () => void;
}

export default function SettingsMenuModal({
  visible,
  theme,
  onClose,
  onThemeChange,
  onPrivacyPolicyPress,
  onContactUsPress,
}: SettingsMenuModalProps) {
  const colors = getColors(theme);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlayBottom(colors)}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent(colors)}>
          <View style={styles.modalHeader(colors)}>
            <Text style={styles.modalTitle(colors)}>Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.menuContent}>
            {/* Theme Toggle */}
            <View style={[styles.menuItem(colors), { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 16, marginBottom: 16 }]}>
              <View style={{ flex: 1, marginRight: 24, paddingRight: 8 }}>
                <Text style={[styles.menuItemText(colors), { flex: 0 }]}>Theme</Text>
                <Text style={[styles.menuItemSubtext(colors)]}>
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </Text>
              </View>
              <View style={{ flexShrink: 0 }}>
                <Switch 
                  value={theme === 'dark'} 
                  onValueChange={(value) => onThemeChange(value ? 'dark' : 'light')}
                  trackColor={{ false: colors.border, true: colors.gobutton }}
                  thumbColor={theme === 'dark' ? colors.card : colors.textSecondary}
                />
              </View>
            </View>

            {/* Privacy Policy */}
            <TouchableOpacity
              style={styles.menuItem(colors)}
              onPress={() => {
                onClose();
                onPrivacyPolicyPress();
              }}
            >
              <FontAwesome5 name="shield-alt" size={18} color={colors.text} style={{ marginRight: 12 }} />
              <Text style={styles.menuItemText(colors)}>Privacy Policy</Text>
              <FontAwesome5 name="chevron-right" size={14} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Contact Us */}
            <TouchableOpacity
              style={styles.menuItem(colors)}
              onPress={() => {
                onClose();
                onContactUsPress();
              }}
            >
              <FontAwesome5 name="envelope" size={18} color={colors.text} style={{ marginRight: 12 }} />
              <Text style={styles.menuItemText(colors)}>Contact Us</Text>
              <FontAwesome5 name="chevron-right" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

