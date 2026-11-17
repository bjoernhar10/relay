import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, TextInput, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/icon-button';
import { makeStyles, useTheme } from '@/theme';

import { AttachmentSheet } from './attachment-sheet';
import { SendButton } from './send-button';

const maxVisibleLines = 6;

type ComposerProps = {
  isResponding: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function Composer({ isResponding, onSend, onStop, onLayout }: ComposerProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const sheetRef = useRef<BottomSheetModal>(null);
  const trimmed = text.trim();

  const send = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(trimmed);
    setText('');
  };

  const stop = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStop();
  };

  const openSheet = () => {
    Keyboard.dismiss();
    sheetRef.current?.present();
  };

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom + spacing.sm }]}
      onLayout={onLayout}
    >
      <View style={styles.field}>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder={t('composer.placeholder')}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={t('composer.placeholder')}
          style={styles.input}
        />
        <View style={styles.toolbar}>
          <IconButton
            icon="plus"
            accessibilityLabel={t('composer.attach')}
            onPress={openSheet}
            size="sm"
            color="textSecondary"
          />
          <SendButton
            mode={isResponding ? 'stop' : 'send'}
            disabled={!isResponding && trimmed.length === 0}
            onPress={isResponding ? stop : send}
          />
        </View>
      </View>
      <AttachmentSheet ref={sheetRef} />
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, typography }) => ({
  container: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    backgroundColor: colors.background,
  },
  field: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
    maxHeight: typography.body.lineHeight * maxVisibleLines,
    textAlignVertical: 'top',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));
