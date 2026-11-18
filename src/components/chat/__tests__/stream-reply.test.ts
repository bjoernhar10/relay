import type { StreamChatRequest } from '@/providers/adapter';
import { createProviderAdapter } from '@/providers/create-adapter';
import { modelsQueryKey } from '@/providers/models-query';
import { queryClient } from '@/providers/query-client';
import type { ModelInfo, ProviderConfig } from '@/providers/types';
import { useProviderStore } from '@/store/provider-store';

import { streamReply, toRequestMessages } from '../stream-reply';

jest.mock('@/providers/create-adapter', () => ({ createProviderAdapter: jest.fn() }));

describe('toRequestMessages', () => {
  it('sends user turns and usable replies, but skips failed or empty ones', () => {
    const reply = { role: 'assistant' as const, reasoning: '', modelLabel: 'm' };
    expect(
      toRequestMessages([
        { id: '1', role: 'user', content: 'Hallo' },
        { ...reply, id: '2', content: 'Hi!', status: 'complete' },
        { id: '3', role: 'user', content: 'Und?' },
        { ...reply, id: '4', content: 'Teil', status: 'stopped' },
        { ...reply, id: '5', content: '', status: 'stopped' },
        { ...reply, id: '6', content: 'kaputt', status: 'error' },
      ]),
    ).toEqual([
      { role: 'user', content: 'Hallo' },
      { role: 'assistant', content: 'Hi!' },
      { role: 'user', content: 'Und?' },
      { role: 'assistant', content: 'Teil' },
    ]);
  });
});

describe('streamReply', () => {
  // Cached queries schedule garbage collection timers that would outlive the test.
  afterEach(() => queryClient.clear());

  const provider: ProviderConfig = {
    id: 'anthropic-1',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    protocol: 'anthropic',
    hasApiKey: true,
    createdAt: 0,
    updatedAt: 1,
  };
  const modelInfo: ModelInfo = {
    id: 'claude-test',
    providerId: provider.id,
    maxOutputTokens: 128000,
    supportsAdaptiveThinking: true,
    source: 'api',
  };

  it('passes the loaded model details to the adapter', async () => {
    useProviderStore.setState({ providers: [provider] });
    queryClient.setQueryData(modelsQueryKey(provider), [modelInfo]);
    const requests: StreamChatRequest[] = [];
    jest.mocked(createProviderAdapter).mockResolvedValue({
      listModels: jest.fn(),
      async *streamChat(request) {
        requests.push(request);
        yield { type: 'text', text: 'Hi' };
        yield { type: 'done' };
      },
    });
    const onChunk = jest.fn();

    await streamReply({
      model: { providerId: provider.id, modelId: 'claude-test' },
      messages: [{ role: 'user', content: 'Hallo' }],
      signal: new AbortController().signal,
      onChunk,
    });

    expect(requests[0]?.modelInfo).toEqual(modelInfo);
    expect(onChunk).toHaveBeenCalledWith({ type: 'text', text: 'Hi' });
  });

  it('fails with notFound when the provider was removed', async () => {
    useProviderStore.setState({ providers: [] });

    await expect(
      streamReply({
        model: { providerId: 'gone', modelId: 'x' },
        messages: [],
        signal: new AbortController().signal,
        onChunk: jest.fn(),
      }),
    ).rejects.toMatchObject({ kind: 'notFound' });
  });
});
