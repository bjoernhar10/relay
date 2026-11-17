import { useColorScheme } from 'react-native';

import { useThemeStore, type ThemePreference } from '@/store/theme-store';

import { colors, type ColorScheme } from './colors';
import { layout, motion, opacity, radii, sizes, spacing, typography } from './tokens';

export function resolveColorScheme(
  preference: ThemePreference,
  systemScheme: string | null | undefined,
): ColorScheme {
  if (preference !== 'system') return preference;
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  const preference = useThemeStore((state) => state.preference);
  const scheme = resolveColorScheme(preference, useColorScheme());
  return {
    scheme,
    colors: colors[scheme],
    spacing,
    radii,
    sizes,
    layout,
    motion,
    opacity,
    typography,
  };
}

export type Theme = ReturnType<typeof useTheme>;
