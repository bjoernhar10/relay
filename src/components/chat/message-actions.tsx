import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import { useCopyToClipboard } from '@/components/use-copy-to-clipboard';
import { makeStyles } from '@/theme';

type MessageActionsProps = {
  content: string;
  modelLabel: string;
};

export function MessageActions({ content, modelLabel }: MessageActionsProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { copied, copy } = useCopyToClipboard();

  return (
    <View style={styles.row}>
      <IconButton
        icon={copied ? 'check' : 'copy'}
        accessibilityLabel={copied ? t('common.copied') : t('common.copy')}
        onPress={() => void copy(content)}
        size="sm"
        color="textSecondary"
      />
      <IconButton
        icon="regenerate"
        accessibilityLabel={t('chat.regenerate')}
        size="sm"
        color="textSecondary"
      />
      <AppText variant="caption" color="textTertiary" numberOfLines={1} style={styles.modelLabel}>
        {modelLabel}
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    // Pulls the first icon's glyph in line with the answer text instead of its touch area.
    marginLeft: -spacing.sm,
  },
  modelLabel: {
    marginLeft: spacing.xs,
  },
}));
