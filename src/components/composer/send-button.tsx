import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { makeStyles, useTheme } from '@/theme';

type SendButtonProps = {
  mode: 'send' | 'stop';
  disabled: boolean;
  onPress: () => void;
};

export function SendButton({ mode, disabled, onPress }: SendButtonProps) {
  const { t } = useTranslation();
  const { colors, motion } = useTheme();
  const styles = useStyles();
  const isStop = mode === 'stop';
  const backgroundColor = isStop
    ? colors.textPrimary
    : disabled
      ? colors.surfacePressed
      : colors.accent;

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(backgroundColor, { duration: motion.fast }),
  }));

  return (
    <Animated.View style={[styles.button, backgroundStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isStop ? t('composer.stop') : t('composer.send')}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <Animated.View
          key={mode}
          entering={FadeIn.duration(motion.fast)}
          exiting={FadeOut.duration(motion.fast)}
        >
          <Icon
            name={isStop ? 'stop' : 'send'}
            size="sm"
            color={isStop ? 'background' : disabled ? 'textTertiary' : 'onAccent'}
            filled={isStop}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const useStyles = makeStyles(({ sizes, opacity }) => ({
  button: {
    width: sizes.actionButton,
    height: sizes.actionButton,
    borderRadius: sizes.actionButton / 2,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: opacity.pressed,
  },
}));
