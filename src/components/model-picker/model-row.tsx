import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { makeStyles } from '@/theme';

type ModelRowProps = {
  label: string;
  providerName?: string;
  selected: boolean;
  onPress: () => void;
};

export function ModelRow({ label, providerName, selected, onPress }: ModelRowProps) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <AppText numberOfLines={1}>{label}</AppText>
        {providerName ? (
          <AppText variant="caption" color="textTertiary">
            {providerName}
          </AppText>
        ) : null}
      </View>
      {selected ? <Icon name="check" size="sm" color="accent" /> : null}
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
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
  text: {
    flex: 1,
  },
}));
