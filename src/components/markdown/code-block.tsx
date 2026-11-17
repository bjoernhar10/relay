import { Prism, useTokenize } from 'prism-react-renderer';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { useCopyToClipboard } from '@/components/use-copy-to-clipboard';
import { makeStyles, useTheme } from '@/theme';

import { syntaxColorFor } from './syntax-colors';

type CodeBlockProps = {
  code: string;
  language: string | undefined;
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const { copied, copy } = useCopyToClipboard();
  const normalizedLanguage = language?.trim().toLowerCase() ?? '';
  const lines = useTokenize({
    prism: Prism,
    code,
    language: normalizedLanguage,
    grammar: Prism.languages[normalizedLanguage],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="captionStrong" color="textTertiary">
          {normalizedLanguage}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('markdown.copyCode')}
          onPress={() => void copy(code)}
          style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
        >
          <Icon name={copied ? 'check' : 'copy'} size="sm" color="textSecondary" />
          <AppText variant="caption" color="textSecondary">
            {copied ? t('common.copied') : t('common.copy')}
          </AppText>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text selectable style={styles.code}>
          {lines.map((line, lineIndex) => (
            <Text key={lineIndex}>
              {line.map((token, tokenIndex) => (
                <Text
                  key={tokenIndex}
                  style={{ color: syntaxColorFor(token.types, colors.syntax) }}
                >
                  {token.content}
                </Text>
              ))}
              {lineIndex < lines.length - 1 ? '\n' : null}
            </Text>
          ))}
        </Text>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, typography }) => ({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
  code: {
    ...typography.code,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
}));
