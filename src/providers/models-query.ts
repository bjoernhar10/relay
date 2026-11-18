import { queryClient } from './query-client';
import type { ModelInfo, ProviderConfig } from './types';

// updatedAt changes whenever URL, protocol or key change, which invalidates the list.
export function modelsQueryKey(provider: ProviderConfig) {
  return ['models', provider.id, provider.updatedAt] as const;
}

export function findCachedModelInfo(
  provider: ProviderConfig,
  modelId: string,
): ModelInfo | undefined {
  return queryClient
    .getQueryData<ModelInfo[]>(modelsQueryKey(provider))
    ?.find((model) => model.id === modelId);
}
