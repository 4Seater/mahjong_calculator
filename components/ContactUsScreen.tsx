import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/colors';
import { FontAwesome5 } from '@expo/vector-icons';

interface ContactUsScreenProps {
  onClose?: () => void;
}

export default function ContactUsScreen({ onClose }: ContactUsScreenProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);

  const handleEmailPress = () => {
    Linking.openURL('mailto:4seaterapp@gmail.com');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Contact Us</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.content}>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We'd love to hear from you! If you have any questions, feedback, or suggestions about the Mahjong Score Calculator, please reach out to us.
          </Text>

          <View style={[styles.emailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <FontAwesome5 name="envelope" size={24} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={[styles.emailLabel, { color: colors.textSecondary }]}>Email Address</Text>
            <TouchableOpacity onPress={handleEmailPress}>
              <Text style={[styles.emailAddress, { color: colors.primary }]}>4seaterapp@gmail.com</Text>
            </TouchableOpacity>
            <Text style={[styles.emailHint, { color: colors.textSecondary }]}>
              Tap to open your email app
            </Text>
          </View>

          <Text style={[styles.paragraph, { color: colors.text, marginTop: 24 }]}>
            We typically respond within 24-48 hours. Thank you for using our app!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    position: 'relative',
    minHeight: Platform.OS === 'ios' ? 80 : 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 50 : 16,
    padding: 8,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  content: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  emailSection: {
    marginTop: 24,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emailLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  emailAddress: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  emailHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

