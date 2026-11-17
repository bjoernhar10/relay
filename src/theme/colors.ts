export type ColorScheme = 'light' | 'dark';

export type SyntaxColors = {
  keyword: string;
  string: string;
  number: string;
  function: string;
  comment: string;
};

export type ThemeColors = {
  background: string;
  sidebar: string;
  surface: string;
  surfaceStrong: string;
  surfacePressed: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  onAccent: string;
  syntax: SyntaxColors;
};

export type ColorToken = Exclude<keyof ThemeColors, 'syntax'>;

export const colors: Record<ColorScheme, ThemeColors> = {
  light: {
    background: '#FFFFFF',
    sidebar: '#F9F9F9',
    surface: '#F4F4F4',
    surfaceStrong: '#EDEDED',
    surfacePressed: '#E6E6E6',
    border: '#E5E5E5',
    textPrimary: '#1A1A1A',
    textSecondary: '#5D5D5D',
    textTertiary: '#8F8F8F',
    accent: '#2F6F62',
    onAccent: '#FFFFFF',
    syntax: {
      keyword: '#9B3D63',
      string: '#2F6F3A',
      number: '#A0581F',
      function: '#2D5F9A',
      comment: '#8F8F8F',
    },
  },
  dark: {
    background: '#212121',
    sidebar: '#181818',
    surface: '#2A2A2A',
    surfaceStrong: '#303030',
    surfacePressed: '#383838',
    border: '#383838',
    textPrimary: '#ECECEC',
    textSecondary: '#A3A3A3',
    textTertiary: '#737373',
    accent: '#5BA593',
    onAccent: '#10201C',
    syntax: {
      keyword: '#D98BA8',
      string: '#8DC28F',
      number: '#E0A26A',
      function: '#86AEDB',
      comment: '#737373',
    },
  },
};
