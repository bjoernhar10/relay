import type { Conversation } from '@/db/types';

export type ChatSummary = Pick<Conversation, 'id' | 'title' | 'pinned' | 'archived' | 'updated'>;
