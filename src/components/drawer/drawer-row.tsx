import { Pressable } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { makeStyles } from '@/theme';

type DrawerRowProps = {
  label: string;
  onPress: () => void;
  onLongPress?: () => void;
  icon?: IconName;
  emphasized?: boolean;
  active?: boolean;
};

export function DrawerRow({
  label,
  onPress,
  onLongPress,
  icon,
  emphasized = false,
  active = false,
}: DrawerRowProps) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, (pressed || active) && styles.highlighted]}
    >
      {icon ? <Icon name={icon} color={emphasized ? 'textPrimary' : 'textSecondary'} /> : null}
      <AppText variant={emphasized ? 'bodyStrong' : 'body'} numberOfLines={1} style={styles.label}>
        {label}
      </AppText>
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
  highlighted: {
    backgroundColor: colors.surfaceStrong,
  },
  label: {
    flex: 1,
  },
}));
