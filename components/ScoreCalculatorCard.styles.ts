import { Dimensions } from 'react-native';

export const styles = {
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
  clearButton: (colors: any) => ({
    backgroundColor: colors.clearButton,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 12,
  }),
  clearButtonText: (colors: any, theme?: 'light' | 'dark') => ({
    color: '#FFFFFF', // White text for clear button
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
    maxHeight: Dimensions.get('window').height * 0.85,
    minHeight: 500,
    flexDirection: 'column' as const,
  }),
  modalHeader: (colors: any) => ({
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexShrink: 0,
  }),
  modalTitle: (colors: any) => ({
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  }),
  modalScrollView: {
    flex: 1,
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
  menuContent: {
    padding: 20,
  },
  menuItem: (colors: any) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    paddingHorizontal: 4,
  }),
  menuItemText: (colors: any) => ({
    fontSize: 16,
    color: colors.text,
    flex: 1,
    fontWeight: '500' as const,
  }),
  menuItemSubtext: (colors: any) => ({
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  }),
};

