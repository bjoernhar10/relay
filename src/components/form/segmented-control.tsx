import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { makeStyles } from '@/theme';

type SegmentedControlProps<Value extends string> = {
  label: string;
  options: readonly { value: Value; label: string }[];
  value: Value;
  onChange: (value: Value) => void;
};

export function SegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<Value>) {
  const styles = useStyles();
  return (
    <View style={styles.field}>
      <AppText variant="captionStrong" color="textSecondary">
        {label}
      </AppText>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.track}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(option.value)}
              style={[styles.segment, selected && styles.selected]}
            >
              <AppText
                variant={selected ? 'bodyStrong' : 'body'}
                color={selected ? 'textPrimary' : 'textSecondary'}
                numberOfLines={1}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes }) => ({
  field: {
    gap: spacing.xs,
  },
  track: {
    flexDirection: 'row',
    padding: spacing.xs,
    gap: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  segment: {
    flex: 1,
    minHeight: sizes.touchTarget - spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  selected: {
    backgroundColor: colors.background,
  },
}));
