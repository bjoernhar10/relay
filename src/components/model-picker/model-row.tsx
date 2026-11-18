import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import { makeStyles } from '@/theme';

type ModelRowProps = {
  label: string;
  caption?: string;
  selected: boolean;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export function ModelRow({
  label,
  caption,
  selected,
  isFavorite,
  onPress,
  onToggleFavorite,
}: ModelRowProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={styles.text}>
          <AppText numberOfLines={1}>{label}</AppText>
          {caption ? (
            <AppText variant="caption" color="textTertiary" numberOfLines={1}>
              {caption}
            </AppText>
          ) : null}
        </View>
        {selected ? <Icon name="check" size="sm" color="accent" /> : null}
      </Pressable>
      <IconButton
        icon="favorite"
        filled={isFavorite}
        accessibilityLabel={
          isFavorite ? t('modelPicker.removeFavorite') : t('modelPicker.addFavorite')
        }
        onPress={onToggleFavorite}
        size="sm"
        color={isFavorite ? 'textPrimary' : 'textTertiary'}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  main: {
    flex: 1,
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
