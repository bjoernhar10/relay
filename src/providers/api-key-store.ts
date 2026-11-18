import * as SecureStore from 'expo-secure-store';

// API keys never leave SecureStore: no logging, no SQLite, no backend (see CLAUDE.md).
function storageKey(providerId: string): string {
  return `relay.provider-key.${providerId}`;
}

export function saveApiKey(providerId: string, apiKey: string): Promise<void> {
  return SecureStore.setItemAsync(storageKey(providerId), apiKey);
}

export function readApiKey(providerId: string): Promise<string | null> {
  return SecureStore.getItemAsync(storageKey(providerId));
}

export function deleteApiKey(providerId: string): Promise<void> {
  return SecureStore.deleteItemAsync(storageKey(providerId));
}
