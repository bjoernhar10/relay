import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { makeStyles, useTheme } from '@/theme';

const suggestionKeys = ['email', 'explainCode', 'summarize', 'brainstorm'] as const;

export function EmptyChat() {
  const { t } = useTranslation();
  const { motion } = useTheme();
  const styles = useStyles();

  return (
    <Animated.View entering={FadeIn.duration(motion.normal)} style={styles.container}>
      <View style={styles.greeting}>
        <AppText variant="display" accessibilityRole="header" style={styles.greetingText}>
          {t('emptyChat.greeting')}
        </AppText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.suggestions}
      >
        {suggestionKeys.map((key) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <AppText variant="bodyStrong" numberOfLines={1}>
              {t(`emptyChat.suggestions.${key}.title`)}
            </AppText>
            <AppText color="textSecondary" numberOfLines={1}>
              {t(`emptyChat.suggestions.${key}.detail`)}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes }) => ({
  container: {
    flex: 1,
  },
  greeting: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  greetingText: {
    textAlign: 'center',
  },
  suggestions: {
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  card: {
    width: sizes.suggestionCardWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    backgroundColor: colors.surfacePressed,
  },
}));
