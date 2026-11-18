// Test-only stand-in for expo-sqlite: the same async API subset, backed by Node's built-in
// SQLite, so repositories and migrations run against a real database in Jest.
const { DatabaseSync } = require('node:sqlite');

function bindParams(args) {
  return args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
}

function createNodeSqliteDatabase() {
  const db = new DatabaseSync(':memory:');
  return {
    execAsync: async (source) => {
      db.exec(source);
    },
    runAsync: async (source, ...args) => {
      const result = db.prepare(source).run(...bindParams(args));
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    getAllAsync: async (source, ...args) =>
      db
        .prepare(source)
        .all(...bindParams(args))
        .map((row) => ({ ...row })),
    getFirstAsync: async (source, ...args) => {
      const row = db.prepare(source).get(...bindParams(args));
      return row ? { ...row } : null;
    },
    withTransactionAsync: async (task) => {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

module.exports = { createNodeSqliteDatabase };
