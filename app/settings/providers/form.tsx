import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ProviderForm } from '@/components/settings/provider-form';
import { deleteProvider, saveProvider } from '@/providers/provider-actions';
import { draftFromPreset, type ProviderDraft } from '@/providers/provider-draft';
import { findPreset } from '@/providers/presets';
import { useProviderStore } from '@/store/provider-store';

export default function ProviderFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id, presetId } = useLocalSearchParams<{ id?: string; presetId?: string }>();
  const existing = useProviderStore((state) =>
    state.providers.find((provider) => provider.id === id),
  );

  const initialDraft: ProviderDraft = existing
    ? { name: existing.name, baseUrl: existing.baseUrl, protocol: existing.protocol, apiKey: '' }
    : draftFromPreset(findPreset(presetId));

  const returnToList = () => router.dismissTo('/settings/providers');

  const save = async (draft: ProviderDraft, { removeApiKey }: { removeApiKey: boolean }) => {
    await saveProvider({ draft, existingId: existing?.id, presetId, removeApiKey });
    returnToList();
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert(
      t('providers.form.deleteConfirmTitle'),
      t('providers.form.deleteConfirmMessage', { name: existing.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('providers.form.delete'),
          style: 'destructive',
          onPress: () => {
            returnToList();
            void deleteProvider(existing.id);
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{ title: existing ? t('providers.form.editTitle') : t('providers.form.newTitle') }}
      />
      <ProviderForm
        key={existing?.id ?? presetId ?? 'custom'}
        initialDraft={initialDraft}
        hasStoredApiKey={existing?.hasApiKey ?? false}
        onSave={save}
        onDelete={existing ? confirmDelete : undefined}
      />
    </>
  );
}
