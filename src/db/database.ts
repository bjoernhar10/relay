import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { migrate } from './migrations';

export type Database = Pick<
  SQLiteDatabase,
  'execAsync' | 'runAsync' | 'getAllAsync' | 'getFirstAsync' | 'withTransactionAsync'
>;

const databaseName = 'relay.db';

export async function prepareDatabase(db: Database): Promise<Database> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db);
  // A reply cannot still be streaming after a restart; whatever arrived before stays visible.
  await db.runAsync("UPDATE messages SET status = 'stopped' WHERE status = 'streaming'");
  return db;
}

let databasePromise: Promise<Database> | undefined;

export function getDatabase(): Promise<Database> {
  databasePromise ??= openDatabaseAsync(databaseName).then(prepareDatabase);
  return databasePromise;
}
