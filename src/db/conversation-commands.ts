import {
  deleteConversation,
  renameConversation,
  setConversationArchived,
  setConversationPinned,
} from './conversations-repository';
import { getDatabase } from './database';
import { invalidateLocalData } from './queries';

// Actions from the chat menu: write, then let every screen re-read.
async function run(write: (db: Awaited<ReturnType<typeof getDatabase>>) => Promise<void>) {
  await write(await getDatabase());
  await invalidateLocalData();
}

export const renameChat = (id: string, title: string) =>
  run((db) => renameConversation(db, id, title.trim()));

export const setChatPinned = (id: string, pinned: boolean) =>
  run((db) => setConversationPinned(db, id, pinned));

export const setChatArchived = (id: string, archived: boolean) =>
  run((db) => setConversationArchived(db, id, archived));

export const deleteChat = (id: string) => run((db) => deleteConversation(db, id));
