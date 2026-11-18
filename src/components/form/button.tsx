import { Pressable } from 'react-native';

import { AppText } from '@/components/app-text';
import { makeStyles } from '@/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'plain' | 'destructive';
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  const styles = useStyles();
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary && styles.primary,
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <AppText
        variant="bodyStrong"
        color={isPrimary ? 'onAccent' : variant === 'destructive' ? 'danger' : 'textPrimary'}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes, opacity }) => ({
  button: {
    minHeight: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  dimmed: {
    opacity: opacity.pressed,
  },
}));
