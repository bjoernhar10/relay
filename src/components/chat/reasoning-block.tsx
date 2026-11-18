import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { makeStyles, useTheme } from '@/theme';

type ReasoningBlockProps = {
  reasoning: string;
  isThinking: boolean;
};

export function ReasoningBlock({ reasoning, isThinking }: ReasoningBlockProps) {
  const { t } = useTranslation();
  const { motion } = useTheme();
  const styles = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isExpanded ? '90deg' : '0deg', { duration: motion.fast }) }],
  }));

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityHint={isExpanded ? t('chat.hideReasoning') : t('chat.showReasoning')}
        onPress={() => setIsExpanded((current) => !current)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <AppText variant="captionStrong" color="textSecondary">
          {isThinking ? t('chat.thinking') : t('chat.reasoning')}
        </AppText>
        <Animated.View style={chevronStyle}>
          <Icon name="chevronRight" size="sm" color="textTertiary" />
        </Animated.View>
      </Pressable>
      {isExpanded ? (
        <Animated.View entering={FadeIn.duration(motion.fast)} style={styles.body}>
          <Text selectable style={styles.text}>
            {reasoning}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes, typography }) => ({
  container: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: sizes.actionButton,
    paddingHorizontal: spacing.sm,
    marginLeft: -spacing.sm,
    borderRadius: radii.sm,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
  body: {
    alignSelf: 'stretch',
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingLeft: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
  },
}));
