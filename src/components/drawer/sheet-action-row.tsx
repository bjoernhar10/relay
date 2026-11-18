import { Pressable } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { makeStyles } from '@/theme';

type SheetActionRowProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export function SheetActionRow({ icon, label, onPress, destructive = false }: SheetActionRowProps) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Icon name={icon} color={destructive ? 'danger' : 'textSecondary'} />
      <AppText color={destructive ? 'danger' : 'textPrimary'}>{label}</AppText>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
}));
