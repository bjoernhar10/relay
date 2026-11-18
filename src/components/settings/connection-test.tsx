import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/form/button';
import { Icon } from '@/components/icon';
import { providerErrorMessage } from '@/providers/provider-error-message';
import { makeStyles, useTheme } from '@/theme';

export type ConnectionTestState =
  | { status: 'idle' }
  | { status: 'testing' }
  | { status: 'success'; modelCount: number }
  | { status: 'error'; error: unknown };

type ConnectionTestProps = {
  state: ConnectionTestState;
  onTest: () => void;
};

export function ConnectionTest({ state, onTest }: ConnectionTestProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Button
        variant="plain"
        label={
          state.status === 'testing' ? t('providers.form.testing') : t('providers.form.testKey')
        }
        onPress={onTest}
        disabled={state.status === 'testing'}
      />
      <View accessibilityLiveRegion="polite" style={styles.result}>
        {state.status === 'testing' ? (
          <ActivityIndicator size="small" color={colors.textTertiary} />
        ) : null}
        {state.status === 'success' ? (
          <>
            <Icon name="check" size="sm" color="accent" />
            <AppText color="textSecondary">
              {t('providers.form.testSuccess', { count: state.modelCount })}
            </AppText>
          </>
        ) : null}
        {state.status === 'error' ? (
          <>
            <Icon name="alert" size="sm" color="danger" />
            <AppText color="textSecondary" style={styles.message}>
              {providerErrorMessage(state.error)}
            </AppText>
          </>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  container: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  message: {
    flex: 1,
  },
}));
