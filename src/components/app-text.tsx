import { Text, type TextProps } from 'react-native';

import { useTheme, type ColorToken, type TypographyVariant } from '@/theme';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
};

export function AppText({
  variant = 'body',
  color = 'textPrimary',
  style,
  ...props
}: AppTextProps) {
  const { colors, typography } = useTheme();
  return <Text style={[typography[variant], { color: colors[color] }, style]} {...props} />;
}
