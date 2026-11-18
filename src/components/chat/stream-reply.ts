import type { ChatRequestMessage, ChatStreamChunk } from '@/providers/adapter';
import { createProviderAdapter } from '@/providers/create-adapter';
import { findCachedModelInfo } from '@/providers/models-query';
import { ProviderError } from '@/providers/provider-error';
import type { ModelRef } from '@/store/model-store';
import { useProviderStore } from '@/store/provider-store';

import type { ChatMessage } from './chat-message';

export type ContentChunk = Extract<ChatStreamChunk, { type: 'text' | 'reasoning' }>;

type StreamReplyInput = {
  model: ModelRef;
  messages: ChatRequestMessage[];
  signal: AbortSignal;
  onChunk: (chunk: ContentChunk) => void;
};

// Failed or empty replies are left out, so a retry does not send the broken turn back.
export function toRequestMessages(history: ChatMessage[]): ChatRequestMessage[] {
  return history.flatMap((message): ChatRequestMessage[] => {
    if (message.role === 'user') return [{ role: 'user', content: message.content }];
    const isUsable = message.status !== 'error' && message.content.trim().length > 0;
    return isUsable ? [{ role: 'assistant', content: message.content }] : [];
  });
}

export async function streamReply({ model, messages, signal, onChunk }: StreamReplyInput) {
  const provider = useProviderStore
    .getState()
    .providers.find((candidate) => candidate.id === model.providerId);
  if (!provider) throw new ProviderError('notFound');

  const adapter = await createProviderAdapter({
    providerId: provider.id,
    baseUrl: provider.baseUrl,
    protocol: provider.protocol,
  });

  for await (const chunk of adapter.streamChat({
    model: model.modelId,
    messages,
    modelInfo: findCachedModelInfo(provider, model.modelId),
    signal,
  })) {
    if (chunk.type !== 'done') onChunk(chunk);
  }
}
