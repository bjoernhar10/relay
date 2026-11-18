import { useModelStore } from '@/store/model-store';
import { useProviderStore } from '@/store/provider-store';

import { deleteApiKey, saveApiKey } from './api-key-store';
import { normalizeBaseUrl, type ProviderDraft } from './provider-draft';

type SaveProviderInput = {
  draft: ProviderDraft;
  existingId?: string;
  presetId?: string;
  removeApiKey?: boolean;
};

// The config is written before the key, and hasApiKey is only set once SecureStore succeeded,
// so the store never claims a key that was not actually saved.
export async function saveProvider({
  draft,
  existingId,
  presetId,
  removeApiKey = false,
}: SaveProviderInput): Promise<string> {
  const { addProvider, updateProvider } = useProviderStore.getState();
  const fields = {
    name: draft.name.trim(),
    baseUrl: normalizeBaseUrl(draft.baseUrl),
    protocol: draft.protocol,
  };

  const providerId = existingId ?? addProvider({ ...fields, presetId, hasApiKey: false }).id;
  if (existingId) updateProvider(existingId, fields);

  const apiKey = draft.apiKey.trim();
  if (apiKey) {
    await saveApiKey(providerId, apiKey);
    updateProvider(providerId, { hasApiKey: true });
  } else if (removeApiKey) {
    await deleteApiKey(providerId);
    updateProvider(providerId, { hasApiKey: false });
  }

  return providerId;
}

export async function deleteProvider(providerId: string): Promise<void> {
  await deleteApiKey(providerId);
  useProviderStore.getState().removeProvider(providerId);
  useModelStore.getState().forgetProvider(providerId);
}
