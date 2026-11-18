import { prepareDatabase, type Database } from '@/db/database';

import { createNodeSqliteDatabase } from './node-sqlite-database';

export function createTestDatabase(): Promise<Database> {
  return prepareDatabase(createNodeSqliteDatabase() as unknown as Database);
}
