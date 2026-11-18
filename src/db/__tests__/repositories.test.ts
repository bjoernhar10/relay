import { createTestDatabase } from '@test-utils/test-database';

import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  recordConversationActivity,
  renameConversation,
  setConversationArchived,
  setConversationPinned,
  setGeneratedTitle,
} from '../conversations-repository';
import { prepareDatabase, type Database } from '../database';
import {
  deleteMessagesFrom,
  finishMessage,
  insertMessage,
  listMessages,
  updateMessageContent,
} from '../messages-repository';

let db: Database;

beforeEach(async () => {
  db = await createTestDatabase();
});

describe('schema', () => {
  it('creates both tables with sync fields and records the schema version', async () => {
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );
    expect(tables.map((table) => table.name)).toEqual(['conversations', 'messages']);
    expect(await db.getFirstAsync('PRAGMA user_version')).toEqual({ user_version: 1 });

    const conversation = await createConversation(db, { title: 'Hallo' });
    expect(conversation).toMatchObject({ titleSource: 'provisional', syncStatus: 'pending' });
    expect(conversation.id).toMatch(/^[a-z0-9]{15}$/);
  });

  it('runs migrations only once', async () => {
    await createConversation(db, { title: 'bleibt' });
    await prepareDatabase(db);
    expect(await listConversations(db)).toHaveLength(1);
  });

  it('marks replies that were streaming during a restart as stopped', async () => {
    const { id } = await createConversation(db, { title: 'x' });
    await insertMessage(db, { conversationId: id, role: 'assistant', status: 'streaming' });

    await prepareDatabase(db);

    expect((await listMessages(db, id))[0]?.status).toBe('stopped');
  });
});

describe('conversations', () => {
  it('lists pinned chats first, then the most recently updated, without archived ones', async () => {
    const older = await createConversation(db, { title: 'Älter' });
    const pinned = await createConversation(db, { title: 'Angepinnt' });
    const archived = await createConversation(db, { title: 'Archiviert' });
    const newest = await createConversation(db, { title: 'Neu' });
    await db.runAsync(
      "UPDATE conversations SET updated = '2026-01-01T00:00:00.000Z' WHERE id = ?",
      older.id,
    );
    await setConversationPinned(db, pinned.id, true);
    await db.runAsync(
      "UPDATE conversations SET updated = '2026-01-02T00:00:00.000Z' WHERE id = ?",
      pinned.id,
    );
    await setConversationArchived(db, archived.id, true);

    expect((await listConversations(db)).map((chat) => chat.title)).toEqual([
      'Angepinnt',
      'Neu',
      'Älter',
    ]);
    expect((await listConversations(db, { archived: true })).map((chat) => chat.id)).toEqual([
      archived.id,
    ]);
    expect(newest.pinned).toBe(false);
  });

  it('searches titles and message content, treating % and _ literally', async () => {
    const recipe = await createConversation(db, { title: 'Sauerteig' });
    const code = await createConversation(db, { title: 'Hilfe' });
    await createConversation(db, { title: '100% sicher' });
    await insertMessage(db, {
      conversationId: code.id,
      role: 'user',
      content: 'Was macht useMemo?',
      status: 'complete',
    });

    const titles = async (search: string) =>
      (await listConversations(db, { search })).map((chat) => chat.title);

    expect(await titles('sauer')).toEqual(['Sauerteig']);
    expect(await titles('usememo')).toEqual(['Hilfe']);
    expect(await titles('%')).toEqual(['100% sicher']);
    expect(await titles('_')).toEqual([]);
    expect(await titles('  ')).toHaveLength(3);
    expect(recipe.title).toBe('Sauerteig');
  });

  it('never lets a generated title replace one the user chose', async () => {
    const first = await createConversation(db, { title: 'Wie backe ich…' });
    const second = await createConversation(db, { title: 'Was ist…' });

    expect(await setGeneratedTitle(db, first.id, 'Brot backen')).toBe(true);
    await renameConversation(db, second.id, 'Mein Titel');
    expect(await setGeneratedTitle(db, second.id, 'Generiert')).toBe(false);

    expect(await getConversation(db, first.id)).toMatchObject({
      title: 'Brot backen',
      titleSource: 'generated',
    });
    expect(await getConversation(db, second.id)).toMatchObject({
      title: 'Mein Titel',
      titleSource: 'user',
    });
  });

  it('records the model and marks changes for sync', async () => {
    const chat = await createConversation(db, { title: 'x' });
    await db.runAsync("UPDATE conversations SET sync_status = 'synced' WHERE id = ?", chat.id);

    await recordConversationActivity(db, chat.id, { providerId: 'p1', modelId: 'm1' });
    await recordConversationActivity(db, chat.id, null);

    expect(await getConversation(db, chat.id)).toMatchObject({
      providerId: 'p1',
      modelId: 'm1',
      syncStatus: 'pending',
    });
  });

  it('deletes a chat together with its messages', async () => {
    const chat = await createConversation(db, { title: 'weg' });
    await insertMessage(db, {
      conversationId: chat.id,
      role: 'user',
      content: 'Hi',
      status: 'complete',
    });

    await deleteConversation(db, chat.id);

    expect(await getConversation(db, chat.id)).toBeNull();
    expect(await db.getFirstAsync('SELECT COUNT(*) AS count FROM messages')).toEqual({ count: 0 });
  });
});

describe('messages', () => {
  it('keeps insertion order, stores streamed content and errors', async () => {
    const { id } = await createConversation(db, { title: 'x' });
    await insertMessage(db, {
      conversationId: id,
      role: 'user',
      content: 'Frage',
      status: 'complete',
    });
    const replyId = await insertMessage(db, {
      conversationId: id,
      role: 'assistant',
      status: 'streaming',
      modelLabel: 'Model A',
    });

    await updateMessageContent(db, replyId, { content: 'Teil', reasoning: 'Hm' });
    await finishMessage(db, replyId, {
      status: 'error',
      errorKind: 'rateLimited',
      errorDetail: 'slow down',
    });

    expect(await listMessages(db, id)).toEqual([
      expect.objectContaining({ role: 'user', content: 'Frage' }),
      expect.objectContaining({
        id: replyId,
        content: 'Teil',
        reasoning: 'Hm',
        status: 'error',
        modelLabel: 'Model A',
        errorKind: 'rateLimited',
        errorDetail: 'slow down',
      }),
    ]);
  });

  it('removes a message and everything after it', async () => {
    const { id } = await createConversation(db, { title: 'x' });
    const other = await createConversation(db, { title: 'andere' });
    const ids: string[] = [];
    for (const content of ['F1', 'A1', 'F2', 'A2']) {
      ids.push(
        await insertMessage(db, {
          conversationId: id,
          role: ids.length % 2 === 0 ? 'user' : 'assistant',
          content,
          status: 'complete',
        }),
      );
    }
    await insertMessage(db, {
      conversationId: other.id,
      role: 'user',
      content: 'bleibt',
      status: 'complete',
    });

    await deleteMessagesFrom(db, id, ids[1]!);

    expect((await listMessages(db, id)).map((message) => message.content)).toEqual(['F1']);
    expect(await listMessages(db, other.id)).toHaveLength(1);
  });
});
