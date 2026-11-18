import type { ProviderAdapter } from './adapter';
import { createAnthropicAdapter } from './anthropic';
import { readApiKey } from './api-key-store';
import type { FetchLike } from './http';
import { createOpenAICompatibleAdapter } from './openai-compatible';
import type { ProviderProtocol } from './types';

export type AdapterTarget = {
  providerId: string;
  baseUrl: string;
  protocol: ProviderProtocol;
};

export function createAdapterWithKey(
  { providerId, baseUrl, protocol }: AdapterTarget,
  apiKey: string | null,
  fetchImpl?: FetchLike,
): ProviderAdapter {
  const options = { providerId, baseUrl, apiKey, fetchImpl };
  return protocol === 'anthropic'
    ? createAnthropicAdapter(options)
    : createOpenAICompatibleAdapter(options);
}

// The key is read right before use and never kept around, see CLAUDE.md.
export async function createProviderAdapter(target: AdapterTarget): Promise<ProviderAdapter> {
  const apiKey = await readApiKey(target.providerId);
  return createAdapterWithKey(target, apiKey);
}
