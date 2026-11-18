import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { makeStyles, useTheme, type ColorToken } from '@/theme';

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
  size?: 'sm' | 'md';
  color?: ColorToken;
  filled?: boolean;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  size = 'md',
  color = 'textPrimary',
  filled = false,
}: IconButtonProps) {
  const { spacing } = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={size === 'sm' ? spacing.xs : undefined}
      style={({ pressed }) => [
        size === 'sm' ? styles.small : styles.medium,
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} size={size} color={color} filled={filled} />
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, radii, sizes }) => ({
  medium: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  small: {
    width: sizes.actionButton,
    height: sizes.actionButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
}));
