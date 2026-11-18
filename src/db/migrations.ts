import type { Database } from './database';

// Each entry upgrades the schema by one version; PRAGMA user_version records how far we are.
// Never edit a shipped migration, append a new one instead.
const migrations: string[] = [
  `
  CREATE TABLE conversations (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    title_source TEXT NOT NULL CHECK (title_source IN ('provisional', 'generated', 'user')),
    pinned INTEGER NOT NULL DEFAULT 0,
    archived INTEGER NOT NULL DEFAULT 0,
    provider_id TEXT,
    model_id TEXT,
    created TEXT NOT NULL,
    updated TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced'))
  );
  CREATE INDEX conversations_list ON conversations (archived, pinned, updated);

  CREATE TABLE messages (
    id TEXT PRIMARY KEY NOT NULL,
    conversation_id TEXT NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL DEFAULT '',
    reasoning TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('streaming', 'complete', 'stopped', 'error')),
    model_label TEXT,
    error_kind TEXT,
    error_detail TEXT,
    created TEXT NOT NULL,
    updated TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced'))
  );
  CREATE INDEX messages_by_conversation ON messages (conversation_id, created);
  `,
];

export async function migrate(db: Database): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  for (let version = currentVersion; version < migrations.length; version += 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(migrations[version] ?? '');
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
