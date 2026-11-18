import type { Database } from './database';
import { createRecordId, nowIso } from './ids';
import type { Conversation, SyncStatus, TitleSource } from './types';

type ConversationRow = {
  id: string;
  title: string;
  title_source: TitleSource;
  pinned: number;
  archived: number;
  provider_id: string | null;
  model_id: string | null;
  created: string;
  updated: string;
  sync_status: SyncStatus;
};

function toConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    title: row.title,
    titleSource: row.title_source,
    pinned: row.pinned === 1,
    archived: row.archived === 1,
    providerId: row.provider_id,
    modelId: row.model_id,
    created: row.created,
    updated: row.updated,
    syncStatus: row.sync_status,
  };
}

// Every change marks the record for the upcoming sync.
const touched = "updated = ?, sync_status = 'pending'";

export async function createConversation(
  db: Database,
  { title, providerId, modelId }: { title: string; providerId?: string; modelId?: string },
): Promise<Conversation> {
  const id = createRecordId();
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO conversations (id, title, title_source, provider_id, model_id, created, updated)
     VALUES (?, ?, 'provisional', ?, ?, ?, ?)`,
    id,
    title,
    providerId ?? null,
    modelId ?? null,
    now,
    now,
  );
  const created = await getConversation(db, id);
  if (!created) throw new Error('Conversation was not stored');
  return created;
}

export async function getConversation(db: Database, id: string): Promise<Conversation | null> {
  const row = await db.getFirstAsync<ConversationRow>(
    'SELECT * FROM conversations WHERE id = ?',
    id,
  );
  return row ? toConversation(row) : null;
}

function likePattern(search: string): string {
  return `%${search.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

export async function listConversations(
  db: Database,
  { archived = false, search = '' }: { archived?: boolean; search?: string } = {},
): Promise<Conversation[]> {
  const term = search.trim();
  const pattern = likePattern(term);
  const rows = await db.getAllAsync<ConversationRow>(
    `SELECT * FROM conversations c
     WHERE c.archived = ?
       AND (? = '' OR c.title LIKE ? ESCAPE '\\' OR EXISTS (
         SELECT 1 FROM messages m WHERE m.conversation_id = c.id AND m.content LIKE ? ESCAPE '\\'
       ))
     ORDER BY c.pinned DESC, c.updated DESC`,
    archived ? 1 : 0,
    term,
    pattern,
    pattern,
  );
  return rows.map(toConversation);
}

export async function renameConversation(db: Database, id: string, title: string): Promise<void> {
  await db.runAsync(
    `UPDATE conversations SET title = ?, title_source = 'user', ${touched} WHERE id = ?`,
    title,
    nowIso(),
    id,
  );
}

// A generated title only replaces the provisional one, never a title the user typed.
export async function setGeneratedTitle(db: Database, id: string, title: string): Promise<boolean> {
  const result = await db.runAsync(
    `UPDATE conversations SET title = ?, title_source = 'generated', ${touched}
     WHERE id = ? AND title_source = 'provisional'`,
    title,
    nowIso(),
    id,
  );
  return result.changes > 0;
}

export async function setConversationPinned(db: Database, id: string, pinned: boolean) {
  await db.runAsync(
    `UPDATE conversations SET pinned = ?, ${touched} WHERE id = ?`,
    pinned ? 1 : 0,
    nowIso(),
    id,
  );
}

export async function setConversationArchived(db: Database, id: string, archived: boolean) {
  await db.runAsync(
    `UPDATE conversations SET archived = ?, ${touched} WHERE id = ?`,
    archived ? 1 : 0,
    nowIso(),
    id,
  );
}

export async function recordConversationActivity(
  db: Database,
  id: string,
  model: { providerId: string; modelId: string } | null,
): Promise<void> {
  await db.runAsync(
    `UPDATE conversations SET provider_id = COALESCE(?, provider_id), model_id = COALESCE(?, model_id), ${touched}
     WHERE id = ?`,
    model?.providerId ?? null,
    model?.modelId ?? null,
    nowIso(),
    id,
  );
}

// Messages go with it through ON DELETE CASCADE.
export async function deleteConversation(db: Database, id: string): Promise<void> {
  await db.runAsync('DELETE FROM conversations WHERE id = ?', id);
}
