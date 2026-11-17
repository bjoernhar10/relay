import type { MarkedToken, Tokens } from 'marked';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { makeStyles } from '@/theme';

import { asMarkedTokens } from './parse-markdown';

type MarkdownListProps = {
  list: Tokens.List;
  // Injected by MarkdownBlocks to render nested content without a circular import.
  renderBlocks: (tokens: MarkedToken[]) => ReactNode;
};

export function MarkdownList({ list, renderBlocks }: MarkdownListProps) {
  const styles = useStyles();
  const firstNumber = typeof list.start === 'number' ? list.start : 1;

  return (
    <View style={styles.list}>
      {list.items.map((item, index) => (
        <View key={index} style={styles.item}>
          <View style={styles.marker}>
            {item.task ? (
              <Icon name={item.checked ? 'taskDone' : 'taskOpen'} size="sm" />
            ) : (
              <AppText color="textSecondary">
                {list.ordered ? `${firstNumber + index}.` : '•'}
              </AppText>
            )}
          </View>
          <View style={styles.content}>
            {renderBlocks(asMarkedTokens(item.tokens).filter((token) => token.type !== 'checkbox'))}
          </View>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles(({ spacing, sizes }) => ({
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
  },
  marker: {
    minWidth: sizes.iconMd,
    paddingRight: spacing.xs,
    justifyContent: 'flex-start',
  },
  content: {
    flex: 1,
  },
}));
