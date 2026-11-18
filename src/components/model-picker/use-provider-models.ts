import { useQueries } from '@tanstack/react-query';

import { createProviderAdapter } from '@/providers/create-adapter';
import { modelsQueryKey } from '@/providers/models-query';
import type { ModelInfo, ProviderConfig } from '@/providers/types';
import { useProviderStore } from '@/store/provider-store';

const modelListStaleTimeMs = 5 * 60 * 1000;

export type ProviderModelsState = {
  provider: ProviderConfig;
  status: 'loading' | 'error' | 'ready';
  models: ModelInfo[];
  error: unknown;
  retry: () => void;
};

export function useProviderModels(): ProviderModelsState[] {
  const providers = useProviderStore((state) => state.providers);
  const results = useQueries({
    queries: providers.map((provider) => ({
      queryKey: modelsQueryKey(provider),
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const adapter = await createProviderAdapter({
          providerId: provider.id,
          baseUrl: provider.baseUrl,
          protocol: provider.protocol,
        });
        return adapter.listModels(signal);
      },
      staleTime: modelListStaleTimeMs,
    })),
  });

  return providers.map((provider, index) => {
    const result = results[index];
    return {
      provider,
      status: result?.isPending ? 'loading' : result?.isError ? 'error' : 'ready',
      models: result?.data ?? [],
      error: result?.error,
      retry: () => void result?.refetch(),
    };
  });
}
