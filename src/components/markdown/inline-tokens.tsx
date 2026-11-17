import type { Token } from 'marked';
import { Fragment, type ReactNode } from 'react';
import { Linking, Text } from 'react-native';

import { makeStyles } from '@/theme';

import { asMarkedTokens } from './parse-markdown';

type InlineTokensProps = {
  tokens: Token[] | undefined;
};

export function InlineTokens({ tokens }: InlineTokensProps) {
  const styles = useStyles();

  const render = (children: Token[] | undefined): ReactNode[] =>
    asMarkedTokens(children).map((token, index) => {
      switch (token.type) {
        case 'text':
          return token.tokens ? (
            <Fragment key={index}>{render(token.tokens)}</Fragment>
          ) : (
            token.text
          );
        case 'escape':
        case 'html':
          return token.text;
        case 'strong':
          return (
            <Text key={index} style={styles.strong}>
              {render(token.tokens)}
            </Text>
          );
        case 'em':
          return (
            <Text key={index} style={styles.em}>
              {render(token.tokens)}
            </Text>
          );
        case 'del':
          return (
            <Text key={index} style={styles.del}>
              {render(token.tokens)}
            </Text>
          );
        case 'codespan':
          return (
            <Text key={index} style={styles.code}>
              {token.text}
            </Text>
          );
        case 'link':
        case 'image':
          return (
            <Text
              key={index}
              accessibilityRole="link"
              style={styles.link}
              onPress={() => void Linking.openURL(token.href)}
            >
              {token.type === 'link' ? render(token.tokens) : token.text || token.href}
            </Text>
          );
        case 'br':
          return '\n';
        default:
          return null;
      }
    });

  return <>{render(tokens)}</>;
}

const useStyles = makeStyles(({ colors, typography }) => ({
  strong: {
    fontWeight: typography.bodyStrong.fontWeight,
  },
  em: {
    fontStyle: 'italic',
  },
  del: {
    textDecorationLine: 'line-through',
  },
  code: {
    fontFamily: typography.code.fontFamily,
    fontSize: typography.code.fontSize,
    backgroundColor: colors.surface,
  },
  link: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
}));
