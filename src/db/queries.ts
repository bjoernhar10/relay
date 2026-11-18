import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/providers/query-client';

import { getConversation, listConversations } from './conversations-repository';
import { getDatabase } from './database';
import { listMessages } from './messages-repository';

// Local data is read through TanStack Query so every screen updates after a write.
// It never goes stale on its own: writers invalidate the keys below.
const dbKey = ['db'] as const;

export const dbQueryKeys = {
  conversations: (filter: { archived: boolean; search: string }) =>
    [...dbKey, 'conversations', filter] as const,
  conversation: (id: string) => [...dbKey, 'conversation', id] as const,
  messages: (conversationId: string) => [...dbKey, 'messages', conversationId] as const,
};

const localQueryOptions = { staleTime: Infinity, retry: false } as const;

export function useConversations(filter: { archived: boolean; search: string }) {
  return useQuery({
    queryKey: dbQueryKeys.conversations(filter),
    queryFn: async () => listConversations(await getDatabase(), filter),
    placeholderData: (previous) => previous,
    ...localQueryOptions,
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: dbQueryKeys.conversation(id ?? ''),
    queryFn: async () => (id ? getConversation(await getDatabase(), id) : null),
    enabled: id !== null,
    ...localQueryOptions,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: dbQueryKeys.messages(conversationId ?? ''),
    queryFn: async () => (conversationId ? listMessages(await getDatabase(), conversationId) : []),
    enabled: conversationId !== null,
    ...localQueryOptions,
  });
}

export function invalidateMessages(conversationId: string): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: dbQueryKeys.messages(conversationId) });
}

export function invalidateLocalData(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: dbKey });
}
