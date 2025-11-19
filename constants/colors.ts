export type Theme = 'light' | 'dark';

const lightColors = {
  primary: '#4A90E2',
  primaryLight: '#6BA3E8',
  card: '#FFFFFF',
  background: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  inputBackground: '#FAFAFA',
  gobutton: '#4A90E2',
  shadow: '#000000',
};

const darkColors = {
  primary: '#4A90E2',
  primaryLight: '#6BA3E8',
  card: '#1A1A1A',
  background: '#000000',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  border: '#333333',
  inputBackground: '#2A2A2A',
  gobutton: '#4A90E2',
  shadow: '#000000',
};

export const getColors = (theme: Theme) => {
  return theme === 'dark' ? darkColors : lightColors;
};

export default lightColors;
