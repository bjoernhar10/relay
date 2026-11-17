import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from 'expo-router';

import type { Theme } from './use-theme';

export function toNavigationTheme({ scheme, colors }: Theme): NavigationTheme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: scheme === 'dark',
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.accent,
    },
  };
}
