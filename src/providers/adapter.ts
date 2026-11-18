import type { ModelInfo } from './types';

export type ChatRole = 'system' | 'user' | 'assistant';

export type ChatRequestMessage = {
  role: ChatRole;
  content: string;
};

export type StreamChatRequest = {
  model: string;
  messages: ChatRequestMessage[];
  // Details from the provider's model list, if known; adapters fall back to safe defaults.
  modelInfo?: ModelInfo;
  signal?: AbortSignal;
};

export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
};

export type ChatStreamChunk =
  | { type: 'text'; text: string }
  | { type: 'reasoning'; text: string }
  | { type: 'done'; finishReason?: string; usage?: TokenUsage };

export interface ProviderAdapter {
  listModels(signal?: AbortSignal): Promise<ModelInfo[]>;
  // Yields chunks as they arrive and ends with exactly one `done` chunk. Failures are thrown
  // as ProviderError, including `aborted` when the signal fires.
  streamChat(request: StreamChatRequest): AsyncIterable<ChatStreamChunk>;
}
