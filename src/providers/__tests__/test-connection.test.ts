import { saveApiKey } from '../api-key-store';
import type { FetchLike } from '../http';
import { testProviderConnection } from '../test-connection';

const mockFetch = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>();
jest.mock('../http', () => ({
  ...jest.requireActual('../http'),
  defaultFetch: (...args: Parameters<FetchLike>) => mockFetch(...args),
}));

const modelsResponse = {
  ok: true,
  status: 200,
  headers: { get: () => null },
  body: null,
  text: () => Promise.resolve(JSON.stringify({ data: [{ id: 'a' }, { id: 'b' }] })),
};

const draft = {
  name: 'Test',
  baseUrl: 'https://api.example.com/v1/',
  protocol: 'openai-compatible' as const,
  apiKey: '',
};

describe('testProviderConnection', () => {
  beforeEach(() => mockFetch.mockResolvedValue(modelsResponse));

  it('uses the typed key and returns the number of models', async () => {
    await expect(testProviderConnection({ draft: { ...draft, apiKey: ' typed ' } })).resolves.toBe(
      2,
    );
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/models',
      expect.objectContaining({ headers: { Authorization: 'Bearer typed' } }),
    );
  });

  it('falls back to the stored key when the field is empty', async () => {
    await saveApiKey('p1', 'stored-key');

    await testProviderConnection({ draft, storedKeyProviderId: 'p1' });

    expect(mockFetch.mock.calls[0]?.[1].headers).toEqual({ Authorization: 'Bearer stored-key' });
  });

  it('tests Anthropic providers with their own headers', async () => {
    await testProviderConnection({
      draft: {
        ...draft,
        baseUrl: 'https://api.anthropic.com/v1',
        protocol: 'anthropic',
        apiKey: 'k',
      },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/models?limit=1000',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-api-key': 'k' }),
      }),
    );
  });
});
