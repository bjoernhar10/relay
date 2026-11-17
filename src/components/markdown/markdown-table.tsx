import type { Tokens } from 'marked';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { makeStyles, sizes, typography } from '@/theme';

import { InlineTokens } from './inline-tokens';

type MarkdownTableProps = {
  table: Tokens.Table;
};

// React Native has no table layout, so column widths are estimated from the longest cell
// text. Rows then line up without a second measuring pass that would make the layout jump.
const averageCharacterWidth = typography.body.fontSize * 0.55;

function estimateColumnWidths(table: Tokens.Table): number[] {
  return table.header.map((_, column) => {
    const longest = Math.max(
      ...[table.header, ...table.rows].map((row) => row[column]?.text.length ?? 0),
    );
    const estimated = longest * averageCharacterWidth;
    return Math.min(sizes.tableColumnMaxWidth, Math.max(sizes.tableColumnMinWidth, estimated));
  });
}

export function MarkdownTable({ table }: MarkdownTableProps) {
  const styles = useStyles();
  const columnWidths = estimateColumnWidths(table);

  const renderRow = (cells: Tokens.TableCell[], isHeader: boolean, rowKey: string) => (
    <View key={rowKey} style={[styles.row, isHeader && styles.headerRow]}>
      {cells.map((cell, column) => (
        <View key={column} style={[styles.cell, { width: columnWidths[column] }]}>
          <Text
            selectable
            style={[
              isHeader ? styles.headerText : styles.text,
              { textAlign: cell.align ?? 'left' },
            ]}
          >
            <InlineTokens tokens={cell.tokens} />
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {renderRow(table.header, true, 'header')}
        {table.rows.map((row, index) => renderRow(row, false, String(index)))}
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles(({ colors, spacing, typography }) => ({
  table: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  headerRow: {
    borderTopWidth: 0,
  },
  cell: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
  headerText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
}));
