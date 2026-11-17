import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { makeStyles, useTheme } from '@/theme';

export function StreamingIndicator() {
  const { motion, opacity } = useTheme();
  const styles = useStyles();
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    dotOpacity.value = withRepeat(withTiming(opacity.dimmed, { duration: motion.pulse }), -1, true);
    return () => cancelAnimation(dotOpacity);
  }, [dotOpacity, motion.pulse, opacity.dimmed]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

  return <Animated.View style={[styles.dot, pulseStyle]} />;
}

const useStyles = makeStyles(({ colors, sizes }) => ({
  dot: {
    width: sizes.streamingDot,
    height: sizes.streamingDot,
    borderRadius: sizes.streamingDot / 2,
    backgroundColor: colors.textPrimary,
  },
}));
