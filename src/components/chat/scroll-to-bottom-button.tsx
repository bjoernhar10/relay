import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { makeStyles, useTheme } from '@/theme';

type ScrollToBottomButtonProps = {
  onPress: () => void;
};

export function ScrollToBottomButton({ onPress }: ScrollToBottomButtonProps) {
  const { t } = useTranslation();
  const { motion } = useTheme();
  const styles = useStyles();
  return (
    <Animated.View
      entering={FadeIn.duration(motion.fast)}
      exiting={FadeOut.duration(motion.fast)}
      style={styles.wrapper}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('chat.scrollToBottom')}
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Icon name="scrollDown" size="sm" color="textPrimary" />
      </Pressable>
    </Animated.View>
  );
}

const useStyles = makeStyles(({ colors, spacing, sizes }) => ({
  wrapper: {
    position: 'absolute',
    bottom: '100%',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  button: {
    width: sizes.actionButton,
    height: sizes.actionButton,
    borderRadius: sizes.actionButton / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
}));
