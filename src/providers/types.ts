export type ProviderProtocol = 'openai-compatible' | 'anthropic';

export const providerProtocols: readonly ProviderProtocol[] = ['openai-compatible', 'anthropic'];

export type ProviderPreset = {
  id: string;
  name: string;
  baseUrl: string;
  protocol: ProviderProtocol;
};

export type ProviderConfig = {
  id: string;
  name: string;
  baseUrl: string;
  protocol: ProviderProtocol;
  presetId?: string;
  // Only records whether SecureStore holds a key, so lists never need to read the key itself.
  hasApiKey: boolean;
  createdAt: number;
  updatedAt: number;
};

export type ModelInfo = {
  id: string;
  providerId: string;
  displayName?: string;
  contextWindow?: number;
  // Reported by providers that describe their models in detail (Anthropic's /v1/models).
  maxOutputTokens?: number;
  supportsAdaptiveThinking?: boolean;
  source: 'api' | 'manual';
};
