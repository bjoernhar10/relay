import type { MarkedToken } from 'marked';
import { StyleSheet, Text, View } from 'react-native';

import { makeStyles } from '@/theme';

import { CodeBlock } from './code-block';
import { InlineTokens } from './inline-tokens';
import { MarkdownList } from './markdown-list';
import { MarkdownTable } from './markdown-table';
import { asMarkedTokens } from './parse-markdown';

type MarkdownBlocksProps = {
  tokens: MarkedToken[];
};

export function MarkdownBlocks({ tokens }: MarkdownBlocksProps) {
  const styles = useStyles();
  const blocks = tokens.filter((token) => token.type !== 'space' && token.type !== 'def');

  return (
    <View style={styles.blocks}>
      {blocks.map((token, index) => {
        switch (token.type) {
          case 'paragraph':
          case 'text':
            return (
              <Text key={index} selectable style={styles.paragraph}>
                {token.tokens ? <InlineTokens tokens={token.tokens} /> : token.text}
              </Text>
            );
          case 'heading':
            return (
              <Text
                key={index}
                selectable
                accessibilityRole="header"
                style={token.depth <= 2 ? styles.headingLarge : styles.headingSmall}
              >
                <InlineTokens tokens={token.tokens} />
              </Text>
            );
          case 'code':
            return <CodeBlock key={index} code={token.text} language={token.lang} />;
          case 'list':
            return (
              <MarkdownList
                key={index}
                list={token}
                renderBlocks={(itemTokens) => <MarkdownBlocks tokens={itemTokens} />}
              />
            );
          case 'table':
            return <MarkdownTable key={index} table={token} />;
          case 'blockquote':
            return (
              <View key={index} style={styles.blockquote}>
                <MarkdownBlocks tokens={asMarkedTokens(token.tokens)} />
              </View>
            );
          case 'hr':
            return <View key={index} style={styles.rule} />;
          case 'html':
            return (
              <Text key={index} selectable style={styles.paragraph}>
                {token.text}
              </Text>
            );
          default:
            return null;
        }
      })}
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, typography }) => ({
  blocks: {
    gap: spacing.lg,
  },
  paragraph: {
    ...typography.body,
    color: colors.textPrimary,
  },
  headingLarge: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  headingSmall: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
    paddingLeft: spacing.md,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
}));
