import { useMemo } from 'react';

import { useMessages } from '@/db/queries';

import { toChatMessage } from './chat-message';

export function useConversationMessages(conversationId: string | null) {
  const { data, isPending } = useMessages(conversationId);
  const messages = useMemo(() => (data ?? []).map(toChatMessage), [data]);
  const lastMessage = messages.at(-1);

  return {
    messages,
    isLoading: conversationId !== null && isPending,
    isResponding: lastMessage?.role === 'assistant' && lastMessage.status === 'streaming',
  };
}
