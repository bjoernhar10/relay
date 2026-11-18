import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/form/button';
import { makeStyles } from '@/theme';

type NoProvidersProps = {
  onSetUp: () => void;
};

export function NoProviders({ onSetUp }: NoProvidersProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <AppText variant="title">{t('modelPicker.noProvidersTitle')}</AppText>
      <AppText color="textSecondary" style={styles.hint}>
        {t('modelPicker.noProvidersHint')}
      </AppText>
      <Button label={t('modelPicker.setUpProvider')} onPress={onSetUp} />
    </View>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  hint: {
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
}));
