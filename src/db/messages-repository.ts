import type { Database } from './database';
import { createRecordId, nowIso } from './ids';
import type { MessageRole, MessageStatus, StoredMessage, SyncStatus } from './types';

type MessageRow = {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  reasoning: string;
  status: MessageStatus;
  model_label: string | null;
  error_kind: string | null;
  error_detail: string | null;
  created: string;
  updated: string;
  sync_status: SyncStatus;
};

function toMessage(row: MessageRow): StoredMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    reasoning: row.reasoning,
    status: row.status,
    modelLabel: row.model_label,
    errorKind: row.error_kind,
    errorDetail: row.error_detail,
    created: row.created,
    updated: row.updated,
    syncStatus: row.sync_status,
  };
}

const touched = "updated = ?, sync_status = 'pending'";

// Messages written in the same millisecond keep their insertion order through the rowid.
const chronological = 'ORDER BY created, rowid';

type NewMessage = {
  conversationId: string;
  role: MessageRole;
  content?: string;
  status: MessageStatus;
  modelLabel?: string;
};

export async function insertMessage(
  db: Database,
  { conversationId, role, content = '', status, modelLabel }: NewMessage,
): Promise<string> {
  const id = createRecordId();
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO messages (id, conversation_id, role, content, status, model_label, created, updated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    conversationId,
    role,
    content,
    status,
    modelLabel ?? null,
    now,
    now,
  );
  return id;
}

export async function listMessages(db: Database, conversationId: string): Promise<StoredMessage[]> {
  const rows = await db.getAllAsync<MessageRow>(
    `SELECT * FROM messages WHERE conversation_id = ? ${chronological}`,
    conversationId,
  );
  return rows.map(toMessage);
}

export async function updateMessageContent(
  db: Database,
  id: string,
  { content, reasoning }: { content: string; reasoning: string },
): Promise<void> {
  await db.runAsync(
    `UPDATE messages SET content = ?, reasoning = ?, ${touched} WHERE id = ?`,
    content,
    reasoning,
    nowIso(),
    id,
  );
}

export async function finishMessage(
  db: Database,
  id: string,
  {
    status,
    errorKind,
    errorDetail,
  }: { status: Exclude<MessageStatus, 'streaming'>; errorKind?: string; errorDetail?: string },
): Promise<void> {
  await db.runAsync(
    `UPDATE messages SET status = ?, error_kind = ?, error_detail = ?, ${touched} WHERE id = ?`,
    status,
    errorKind ?? null,
    errorDetail ?? null,
    nowIso(),
    id,
  );
}

// Removes a message and everything after it, e.g. before regenerating a reply.
export async function deleteMessagesFrom(db: Database, conversationId: string, messageId: string) {
  await db.runAsync(
    `WITH target AS (SELECT created, rowid AS position FROM messages WHERE id = ?)
     DELETE FROM messages
     WHERE conversation_id = ?
       AND (created > (SELECT created FROM target)
         OR (created = (SELECT created FROM target) AND rowid >= (SELECT position FROM target)))`,
    messageId,
    conversationId,
  );
}
