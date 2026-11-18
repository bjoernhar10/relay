export type SyncStatus = 'pending' | 'synced';

// provisional: start of the first message; generated: written by the model; user: renamed by hand.
export type TitleSource = 'provisional' | 'generated' | 'user';

export type Conversation = {
  id: string;
  title: string;
  titleSource: TitleSource;
  pinned: boolean;
  archived: boolean;
  providerId: string | null;
  modelId: string | null;
  created: string;
  updated: string;
  syncStatus: SyncStatus;
};

export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'streaming' | 'complete' | 'stopped' | 'error';

export type StoredMessage = {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  reasoning: string;
  status: MessageStatus;
  modelLabel: string | null;
  errorKind: string | null;
  errorDetail: string | null;
  created: string;
  updated: string;
  syncStatus: SyncStatus;
};
