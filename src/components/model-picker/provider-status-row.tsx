import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/form/button';
import { providerErrorMessage } from '@/providers/provider-error-message';
import { makeStyles, useTheme } from '@/theme';

type ProviderStatusRowProps = {
  status: 'loading' | 'error' | 'ready';
  error?: unknown;
  isEmpty: boolean;
  onRetry: () => void;
};

export function ProviderStatusRow({ status, error, isEmpty, onRetry }: ProviderStatusRowProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();

  if (status === 'loading') {
    return (
      <View style={styles.row}>
        <ActivityIndicator size="small" color={colors.textTertiary} />
        <AppText color="textTertiary">{t('modelPicker.loading')}</AppText>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.row}>
        <AppText color="textSecondary" style={styles.message}>
          {providerErrorMessage(error)}
        </AppText>
        <Button variant="plain" label={t('common.retry')} onPress={onRetry} />
      </View>
    );
  }

  return isEmpty ? (
    <View style={styles.row}>
      <AppText color="textTertiary">{t('modelPicker.noModels')}</AppText>
    </View>
  ) : null;
}

const useStyles = makeStyles(({ spacing, sizes }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  message: {
    flex: 1,
  },
}));
