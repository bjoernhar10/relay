import { getRandomValues } from 'expo-crypto';

const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
const idLength = 15;

// Same shape as PocketBase record IDs, so records keep their ID when they are synced later.
export function createRecordId(): string {
  const bytes = getRandomValues(new Uint8Array(idLength));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

export function nowIso(): string {
  return new Date().toISOString();
}
