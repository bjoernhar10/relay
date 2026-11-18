import { readApiKey } from './api-key-store';
import { createAdapterWithKey } from './create-adapter';
import { normalizeBaseUrl, type ProviderDraft } from './provider-draft';

type ConnectionTestInput = {
  draft: ProviderDraft;
  // Set when editing: an empty key field then means "use the stored key".
  storedKeyProviderId?: string;
  signal?: AbortSignal;
};

// Tests the values currently in the form, so a key can be checked before it is saved.
export async function testProviderConnection({
  draft,
  storedKeyProviderId,
  signal,
}: ConnectionTestInput): Promise<number> {
  const typedKey = draft.apiKey.trim();
  const apiKey =
    typedKey || (storedKeyProviderId ? await readApiKey(storedKeyProviderId) : null) || null;
  const adapter = createAdapterWithKey(
    {
      providerId: storedKeyProviderId ?? 'connection-test',
      baseUrl: normalizeBaseUrl(draft.baseUrl),
      protocol: draft.protocol,
    },
    apiKey,
  );
  const models = await adapter.listModels(signal);
  return models.length;
}
