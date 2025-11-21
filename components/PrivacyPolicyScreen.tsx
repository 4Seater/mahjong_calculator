import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/colors';
import { FontAwesome5 } from '@expo/vector-icons';

interface PrivacyPolicyScreenProps {
  onClose?: () => void;
}

export default function PrivacyPolicyScreen({ onClose }: PrivacyPolicyScreenProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
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
          <Text style={[styles.mainTitle, { color: colors.text }]}>Privacy Policy for Mahjong Score Calculator</Text>
          
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last updated: November 19, 2025</Text>
          
          <Text style={[styles.paragraph, { color: colors.text, marginTop: 16 }]}>
            Mahjong Score Calculator ("the App") is developed by 4Seater. This Privacy Policy explains how the App collects, uses, and protects your data.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>1. Information We Do Not Collect</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The App does not collect, store, sell, or share:
          </Text>
          <View style={{ marginLeft: 16, marginTop: 8 }}>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>• Personal information</Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>• Contact information</Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>• Location data</Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>• Photos</Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>• Contacts</Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>• Usage analytics</Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>• Advertising data</Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>• Device identifiers</Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>• Any data whatsoever</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.text, marginTop: 12 }]}>
            The App is fully functional offline and does not send any data to any server.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>2. No Accounts, No Tracking</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The App does not require a login and does not track user behavior.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>3. Data Stored on Your Device</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Any preferences or settings you save remain only on your device and are never transmitted externally.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>4. Third-Party Services</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The App uses no third-party analytics, SDKs, or ad networks.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>5. Children's Privacy</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The App is suitable for all ages and collects no data, including from children.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>6. Changes to This Policy</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            If this policy is updated, the new version will be posted at this same URL.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>7. Contact</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            For questions, you may contact the developer at:
          </Text>
          <Text style={[styles.paragraph, { color: colors.primary, fontWeight: '600', marginTop: 8 }]}>
            4seaterapp@gmail.com
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
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 4,
  },
});

