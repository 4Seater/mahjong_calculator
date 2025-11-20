export type Theme = 'light' | 'dark';

const lightColors = {
  primary: '#00C2A8',
  primaryLight: '#00D9BC',
  card: '#FFFFFF',
  background: '#F5F5F5',
  text: '#121212',
  textSecondary: '#666666',
  border: '#E0E0E0',
  inputBackground: '#FAFAFA',
  gobutton: '#00C2A8',
  shadow: '#000000',
};

const darkColors = {
  primary: '#00C2A8',
  primaryLight: '#00D9BC',
  card: '#1E1E1E',
  background: '#121212',
  text: '#FFFFFF',
  textSecondary: '#A7A7A7',
  border: '#333333',
  inputBackground: '#2A2A2A',
  gobutton: '#00C2A8',
  shadow: '#000000',
};

export const getColors = (theme: Theme) => {
  return theme === 'dark' ? darkColors : lightColors;
};

export default lightColors;
