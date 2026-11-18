import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/form/button';
import { IconButton } from '@/components/icon-button';
import { SettingsRow } from '@/components/settings/settings-row';
import { hostOf } from '@/providers/provider-draft';
import { useProviderStore } from '@/store/provider-store';
import { makeStyles } from '@/theme';

export default function ProvidersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();
  const providers = useProviderStore((state) => state.providers);
  const addProvider = () => router.push('/settings/providers/new');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <IconButton icon="plus" accessibilityLabel={t('providers.add')} onPress={addProvider} />
          ),
        }}
      />
      {providers.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="title">{t('providers.emptyTitle')}</AppText>
          <AppText color="textSecondary" style={styles.emptyHint}>
            {t('providers.emptyHint')}
          </AppText>
          <Button label={t('providers.add')} onPress={addProvider} />
        </View>
      ) : (
        providers.map((provider) => (
          <SettingsRow
            key={provider.id}
            label={provider.name}
            detail={hostOf(provider.baseUrl)}
            hint={provider.hasApiKey ? undefined : t('providers.noApiKey')}
            onPress={() =>
              router.push({ pathname: '/settings/providers/form', params: { id: provider.id } })
            }
          />
        ))
      )}
    </ScrollView>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  emptyHint: {
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
}));
