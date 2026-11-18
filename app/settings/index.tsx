import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { DrawerMenuButton } from '@/components/drawer-menu-button';
import { SettingsRow } from '@/components/settings/settings-row';
import { useProviderStore } from '@/store/provider-store';
import { makeStyles } from '@/theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();
  const providerCount = useProviderStore((state) => state.providers.length);

  return (
    <ScrollView contentContainerStyle={styles.content} testID="settings-screen">
      <Stack.Screen options={{ headerLeft: () => <DrawerMenuButton /> }} />
      <SettingsRow
        label={t('settings.providers')}
        hint={providerCount > 0 ? t('providers.count', { count: providerCount }) : undefined}
        onPress={() => router.push('/settings/providers')}
      />
    </ScrollView>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
}));
