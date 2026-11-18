import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { AppText } from '@/components/app-text';
import { SettingsRow } from '@/components/settings/settings-row';
import { hostOf } from '@/providers/provider-draft';
import { providerPresets } from '@/providers/presets';
import { makeStyles } from '@/theme';

export default function NewProviderScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();
  const openForm = (presetId?: string) =>
    router.push({ pathname: '/settings/providers/form', params: presetId ? { presetId } : {} });

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SettingsRow
        label={t('providers.custom')}
        detail={t('providers.customHint')}
        onPress={() => openForm()}
      />
      <AppText variant="captionStrong" color="textTertiary" style={styles.sectionHeader}>
        {t('providers.presets')}
      </AppText>
      {providerPresets.map((preset) => (
        <SettingsRow
          key={preset.id}
          label={preset.name}
          detail={hostOf(preset.baseUrl)}
          onPress={() => openForm(preset.id)}
        />
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
}));
