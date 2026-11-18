import type { StoredMessage } from '@/db/types';
import { ProviderError, type ProviderErrorKind } from '@/providers/provider-error';

import { MissingModelError } from './missing-model-error';

export type AssistantMessageStatus = StoredMessage['status'];

export type UserChatMessage = { id: string; role: 'user'; content: string };

export type AssistantChatMessage = {
  id: string;
  role: 'assistant';
  content: string;
  reasoning: string;
  modelLabel: string;
  status: AssistantMessageStatus;
  error?: unknown;
};

export type ChatMessage = UserChatMessage | AssistantChatMessage;

export const missingModelErrorKind = 'missingModel';

function restoreError({ errorKind, errorDetail }: StoredMessage): unknown {
  if (!errorKind) return undefined;
  if (errorKind === missingModelErrorKind) return new MissingModelError();
  return new ProviderError(errorKind as ProviderErrorKind, { detail: errorDetail ?? undefined });
}

export function toChatMessage(message: StoredMessage): ChatMessage {
  if (message.role === 'user') return { id: message.id, role: 'user', content: message.content };
  return {
    id: message.id,
    role: 'assistant',
    content: message.content,
    reasoning: message.reasoning,
    modelLabel: message.modelLabel ?? '',
    status: message.status,
    error: restoreError(message),
  };
}
