import { Platform, type DimensionValue, type TextStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
} as const;

export const sizes = {
  iconSm: 18,
  iconMd: 22,
  iconStroke: 1.75,
  touchTarget: 44,
  actionButton: 32,
  streamingDot: 8,
  suggestionCardWidth: 220,
  tableColumnMinWidth: 96,
  tableColumnMaxWidth: 240,
} as const;

export const opacity = {
  pressed: 0.7,
  dimmed: 0.35,
} as const;

export const motion = {
  fast: 150,
  normal: 200,
  pulse: 600,
} as const;

export const layout = {
  userBubbleMaxWidth: '85%',
  sheetSnapPoint: '35%',
  tallSheetSnapPoint: '90%',
} as const satisfies Record<string, DimensionValue>;

const fontWeights = {
  regular: '400',
  semibold: '600',
} as const satisfies Record<string, TextStyle['fontWeight']>;

const monospaceFamily = Platform.select({ ios: 'Menlo', default: 'monospace' });

// Four sizes (13 / 17 / 20 / 28) and two weights. Code uses the monospace face at 14,
// because 13 sits visibly too small inside 17pt reading text.
export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: fontWeights.semibold },
  title: { fontSize: 20, lineHeight: 26, fontWeight: fontWeights.semibold },
  body: { fontSize: 17, lineHeight: 26, fontWeight: fontWeights.regular },
  bodyStrong: { fontSize: 17, lineHeight: 26, fontWeight: fontWeights.semibold },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: fontWeights.regular },
  captionStrong: { fontSize: 13, lineHeight: 18, fontWeight: fontWeights.semibold },
  code: {
    fontFamily: monospaceFamily,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: fontWeights.regular,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
