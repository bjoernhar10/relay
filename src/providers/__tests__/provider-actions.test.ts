import * as SecureStore from 'expo-secure-store';
import Storage from 'expo-sqlite/kv-store';

import { useProviderStore } from '@/store/provider-store';

import { readApiKey } from '../api-key-store';
import { deleteProvider, saveProvider } from '../provider-actions';

const secretKey = 'sk-test-secret-123';

const draft = {
  name: ' OpenAI ',
  baseUrl: 'https://api.openai.com/v1/',
  protocol: 'openai-compatible' as const,
  apiKey: secretKey,
};

describe('provider actions', () => {
  beforeEach(() => useProviderStore.setState({ providers: [] }));

  it('stores the config in the store and the key only in SecureStore', async () => {
    const id = await saveProvider({ draft, presetId: 'openai' });

    expect(useProviderStore.getState().providers).toEqual([
      expect.objectContaining({
        id,
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        presetId: 'openai',
        hasApiKey: true,
      }),
    ]);
    expect(await readApiKey(id)).toBe(secretKey);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(`relay.provider-key.${id}`, secretKey);

    const persisted = await Storage.getItem('relay.providers');
    expect(persisted).toContain('"name":"OpenAI"');
    expect(persisted).not.toContain(secretKey);
    expect(JSON.stringify(useProviderStore.getState())).not.toContain(secretKey);
  });

  it('keeps the stored key when editing with an empty key field', async () => {
    const id = await saveProvider({ draft });

    await saveProvider({ draft: { ...draft, name: 'Work', apiKey: '' }, existingId: id });

    expect(useProviderStore.getState().providers[0]).toMatchObject({
      name: 'Work',
      hasApiKey: true,
    });
    expect(await readApiKey(id)).toBe(secretKey);
  });

  it('removes the stored key on request', async () => {
    const id = await saveProvider({ draft });

    await saveProvider({ draft: { ...draft, apiKey: '' }, existingId: id, removeApiKey: true });

    expect(useProviderStore.getState().providers[0]?.hasApiKey).toBe(false);
    expect(await readApiKey(id)).toBeNull();
  });

  it('does not mark a key as stored when SecureStore fails', async () => {
    jest.mocked(SecureStore.setItemAsync).mockRejectedValueOnce(new Error('keychain locked'));

    await expect(saveProvider({ draft })).rejects.toThrow('keychain locked');

    expect(useProviderStore.getState().providers[0]?.hasApiKey).toBe(false);
  });

  it('deletes the config together with its key', async () => {
    const id = await saveProvider({ draft });

    await deleteProvider(id);

    expect(useProviderStore.getState().providers).toEqual([]);
    expect(await readApiKey(id)).toBeNull();
  });
});
