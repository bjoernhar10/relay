import {
  createConversation,
  getConversation,
  recordConversationActivity,
  setGeneratedTitle,
} from '@/db/conversations-repository';
import { getDatabase, type Database } from '@/db/database';
import {
  deleteMessagesFrom,
  finishMessage,
  insertMessage,
  listMessages,
  updateMessageContent,
} from '@/db/messages-repository';
import { invalidateLocalData, invalidateMessages } from '@/db/queries';
import { ProviderError } from '@/providers/provider-error';
import { useModelStore, type ModelRef } from '@/store/model-store';

import { missingModelErrorKind, toChatMessage } from './chat-message';
import { generateTitle, provisionalTitle } from './generate-title';
import { streamReply, toRequestMessages } from './stream-reply';

// Replies are written to SQLite in small batches while they stream; the UI only reads SQLite.
const streamFlushIntervalMs = 120;
const titleTimeoutMs = 30_000;

// Lives outside React so a reply keeps streaming while the user switches chats.
const activeReplies = new Map<string, AbortController>();
const sentInSession = new Set<string>();

export function wasSentInSession(messageId: string): boolean {
  return sentInSession.has(messageId);
}

export function stopReply(conversationId: string): void {
  activeReplies.get(conversationId)?.abort();
}

async function maybeGenerateTitle(db: Database, conversationId: string, model: ModelRef) {
  const conversation = await getConversation(db, conversationId);
  if (conversation?.titleSource !== 'provisional') return;

  const messages = await listMessages(db, conversationId);
  const firstQuestion = messages.find((message) => message.role === 'user');
  const firstAnswer = messages.find(
    (message) => message.role === 'assistant' && message.status === 'complete' && message.content,
  );
  if (!firstQuestion || !firstAnswer) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), titleTimeoutMs);
  try {
    const title = await generateTitle(
      model,
      firstQuestion.content,
      firstAnswer.content,
      controller.signal,
    );
    if (title && (await setGeneratedTitle(db, conversationId, title))) await invalidateLocalData();
  } catch {
    // The provisional title stays; the next completed reply tries again.
  } finally {
    clearTimeout(timeout);
  }
}

async function runReply(db: Database, conversationId: string, replyId: string, model: ModelRef) {
  const controller = new AbortController();
  activeReplies.set(conversationId, controller);

  const history = (await listMessages(db, conversationId))
    .filter((message) => message.id !== replyId)
    .map(toChatMessage);

  let content = '';
  let reasoning = '';
  let hasUnsavedChunks = false;
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let pendingWrites = Promise.resolve();

  const persist = () => {
    clearTimeout(flushTimer);
    flushTimer = undefined;
    if (hasUnsavedChunks) {
      hasUnsavedChunks = false;
      const snapshot = { content, reasoning };
      pendingWrites = pendingWrites
        .then(() => updateMessageContent(db, replyId, snapshot))
        .then(() => invalidateMessages(conversationId));
    }
    return pendingWrites;
  };

  let completed = false;
  try {
    await streamReply({
      model,
      messages: toRequestMessages(history),
      signal: controller.signal,
      onChunk: (chunk) => {
        if (chunk.type === 'text') content += chunk.text;
        else reasoning += chunk.text;
        hasUnsavedChunks = true;
        flushTimer ??= setTimeout(() => void persist(), streamFlushIntervalMs);
      },
    });
    await persist();
    await finishMessage(db, replyId, { status: 'complete' });
    completed = true;
  } catch (error) {
    await persist();
    const wasStopped = error instanceof ProviderError && error.kind === 'aborted';
    await finishMessage(
      db,
      replyId,
      wasStopped
        ? { status: 'stopped' }
        : {
            status: 'error',
            errorKind: error instanceof ProviderError ? error.kind : 'unknown',
            errorDetail: error instanceof ProviderError ? error.detail : undefined,
          },
    );
  } finally {
    if (activeReplies.get(conversationId) === controller) activeReplies.delete(conversationId);
    await recordConversationActivity(db, conversationId, null);
    await invalidateLocalData();
  }

  if (completed) await maybeGenerateTitle(db, conversationId, model);
}

async function startReply(db: Database, conversationId: string) {
  const model = useModelStore.getState().selected;
  const replyId = await insertMessage(db, {
    conversationId,
    role: 'assistant',
    status: model ? 'streaming' : 'error',
    modelLabel: model?.label,
  });

  if (!model) {
    await finishMessage(db, replyId, { status: 'error', errorKind: missingModelErrorKind });
    await invalidateLocalData();
    return;
  }

  await recordConversationActivity(db, conversationId, model);
  await invalidateLocalData();
  await runReply(db, conversationId, replyId, model);
}

type SendResult = {
  conversationId: string;
  // Resolves once the reply has finished streaming (and its title was generated).
  reply: Promise<void>;
};

export async function sendMessage(
  conversationId: string | null,
  text: string,
): Promise<SendResult> {
  const db = await getDatabase();
  const model = useModelStore.getState().selected;
  const id =
    conversationId ??
    (
      await createConversation(db, {
        title: provisionalTitle(text),
        providerId: model?.providerId,
        modelId: model?.modelId,
      })
    ).id;

  if (activeReplies.has(id)) return { conversationId: id, reply: Promise.resolve() };

  const userMessageId = await insertMessage(db, {
    conversationId: id,
    role: 'user',
    content: text,
    status: 'complete',
  });
  sentInSession.add(userMessageId);
  return { conversationId: id, reply: startReply(db, id) };
}

// Drops the reply and everything after it, then asks again with the current model.
export async function regenerateReply(conversationId: string, replyId: string): Promise<void> {
  if (activeReplies.has(conversationId)) return;
  const db = await getDatabase();
  await deleteMessagesFrom(db, conversationId, replyId);
  await startReply(db, conversationId);
}
