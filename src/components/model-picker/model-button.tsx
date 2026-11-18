import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { useModelStore } from '@/store/model-store';
import { makeStyles } from '@/theme';

import { ModelPickerSheet } from './model-picker-sheet';

export function ModelButton() {
  const { t } = useTranslation();
  const styles = useStyles();
  const sheetRef = useRef<BottomSheetModal>(null);
  const modelLabel = useModelStore((state) => state.selected?.label);

  const openPicker = () => {
    Keyboard.dismiss();
    sheetRef.current?.present();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityHint={t('chat.selectModel')}
        onPress={openPicker}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <AppText variant="bodyStrong" numberOfLines={1} style={styles.label}>
          {modelLabel ?? t('chat.chooseModel')}
        </AppText>
        <Icon name="chevronDown" size="sm" />
      </Pressable>
      <ModelPickerSheet ref={sheetRef} />
    </>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes }) => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
  label: {
    flexShrink: 1,
  },
}));
