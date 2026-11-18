import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import { makeStyles, useTheme } from '@/theme';

type AddModelRowProps = {
  providerName: string;
  onAdd: (modelId: string) => void;
};

export function AddModelRow({ providerName, onAdd }: AddModelRowProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const [isEditing, setIsEditing] = useState(false);
  const [modelId, setModelId] = useState('');
  const trimmed = modelId.trim();

  const submit = () => {
    if (!trimmed) return;
    onAdd(trimmed);
    setModelId('');
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('modelPicker.addModelFor', { provider: providerName })}
        onPress={() => setIsEditing(true)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Icon name="plus" size="sm" color="textTertiary" />
        <AppText color="textSecondary">{t('modelPicker.addModel')}</AppText>
      </Pressable>
    );
  }

  return (
    <View style={styles.editor}>
      <BottomSheetTextInput
        autoFocus
        value={modelId}
        onChangeText={setModelId}
        onSubmitEditing={submit}
        placeholder={t('modelPicker.modelIdPlaceholder')}
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel={t('modelPicker.modelIdPlaceholder')}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        style={styles.input}
      />
      <IconButton
        icon="check"
        accessibilityLabel={t('modelPicker.confirmAddModel')}
        onPress={submit}
        size="sm"
        color={trimmed ? 'accent' : 'textTertiary'}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes, typography }) => ({
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
  editor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    minHeight: sizes.touchTarget,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
}));
