import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/form/button';
import { Icon } from '@/components/icon';
import { ProviderError } from '@/providers/provider-error';
import { providerErrorMessage } from '@/providers/provider-error-message';
import { makeStyles } from '@/theme';

import { MissingModelError } from './missing-model-error';

type ErrorNoticeProps = {
  error: unknown;
  onRetry?: () => void;
};

export function ErrorNotice({ error, onRetry }: ErrorNoticeProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const message =
    error instanceof MissingModelError ? t('chat.noModelSelected') : providerErrorMessage(error);
  const detail = error instanceof ProviderError ? error.detail : undefined;

  return (
    <View accessibilityRole="alert" style={styles.notice}>
      <Icon name="alert" size="sm" color="danger" />
      <View style={styles.text}>
        <AppText>{message}</AppText>
        {detail ? (
          <AppText variant="caption" color="textTertiary" numberOfLines={3}>
            {detail}
          </AppText>
        ) : null}
        {onRetry ? (
          <View style={styles.action}>
            <Button variant="plain" label={t('common.retry')} onPress={onRetry} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii }) => ({
  notice: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  action: {
    alignItems: 'flex-start',
    marginLeft: -spacing.lg,
    marginBottom: -spacing.sm,
  },
}));
