import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ProviderConfig } from '@/providers/types';

type ProviderFields = Pick<ProviderConfig, 'name' | 'baseUrl' | 'protocol' | 'presetId'>;

type ProviderState = {
  providers: ProviderConfig[];
  addProvider: (fields: ProviderFields & { hasApiKey: boolean }) => ProviderConfig;
  updateProvider: (id: string, changes: Partial<ProviderFields & { hasApiKey: boolean }>) => void;
  removeProvider: (id: string) => void;
};

function createProviderId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set) => ({
      providers: [],
      addProvider: (fields) => {
        const now = Date.now();
        const provider: ProviderConfig = {
          ...fields,
          id: createProviderId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ providers: [...state.providers, provider] }));
        return provider;
      },
      updateProvider: (id, changes) =>
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id === id ? { ...provider, ...changes, updatedAt: Date.now() } : provider,
          ),
        })),
      removeProvider: (id) =>
        set((state) => ({ providers: state.providers.filter((provider) => provider.id !== id) })),
    }),
    {
      name: 'relay.providers',
      version: 1,
      storage: createJSONStorage(() => Storage),
      partialize: (state) => ({ providers: state.providers }),
    },
  ),
);
