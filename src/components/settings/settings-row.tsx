import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { makeStyles } from '@/theme';

type SettingsRowProps = {
  label: string;
  detail?: string;
  hint?: string;
  onPress: () => void;
};

export function SettingsRow({ label, detail, hint, onPress }: SettingsRowProps) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <AppText numberOfLines={1}>{label}</AppText>
        {detail ? (
          <AppText variant="caption" color="textTertiary" numberOfLines={1}>
            {detail}
          </AppText>
        ) : null}
      </View>
      {hint ? (
        <AppText variant="caption" color="textSecondary">
          {hint}
        </AppText>
      ) : null}
      <Icon name="chevronRight" size="sm" color="textTertiary" />
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
  text: {
    flex: 1,
  },
}));
