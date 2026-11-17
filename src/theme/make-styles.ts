import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import type { ColorScheme } from './colors';
import { useTheme, type Theme } from './use-theme';

type NamedStyles<T> = { [Key in keyof T]: ViewStyle | TextStyle | ImageStyle };

// Styles depend only on the color scheme, so each scheme's StyleSheet is built once and reused.
export function makeStyles<T extends NamedStyles<T>>(factory: (theme: Theme) => T) {
  const cache = new Map<ColorScheme, T>();
  return function useStyles(): T {
    const theme = useTheme();
    const cached = cache.get(theme.scheme);
    if (cached) return cached;
    const styles = StyleSheet.create(factory(theme));
    cache.set(theme.scheme, styles);
    return styles;
  };
}
