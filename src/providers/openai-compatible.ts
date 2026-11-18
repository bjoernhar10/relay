import type { ChatStreamChunk, ProviderAdapter, StreamChatRequest, TokenUsage } from './adapter';
import { defaultFetch, joinUrl, readJsonResponse, sendRequest, type FetchLike } from './http';
import { isRecord, readNumber, readRecord, readString, type JsonRecord } from './json';
import { errorFromStreamPayload, ProviderError } from './provider-error';
import { readJsonEvents } from './sse-json';
import type { ModelInfo } from './types';

type OpenAICompatibleOptions = {
  providerId: string;
  baseUrl: string;
  apiKey: string | null;
  fetchImpl?: FetchLike;
};

const doneMarker = '[DONE]';

function toModelInfo(entry: unknown, providerId: string): ModelInfo | undefined {
  if (!isRecord(entry)) return undefined;
  const id = readString(entry, 'id');
  if (!id) return undefined;
  return {
    id,
    providerId,
    // OpenRouter and some others add a readable name and the context size.
    displayName: readString(entry, 'name'),
    contextWindow: readNumber(entry, 'context_length') ?? readNumber(entry, 'context_window'),
    source: 'api',
  };
}

function readUsage(payload: JsonRecord): TokenUsage | undefined {
  const usage = readRecord(payload, 'usage');
  if (!usage) return undefined;
  const inputTokens = readNumber(usage, 'prompt_tokens');
  const outputTokens = readNumber(usage, 'completion_tokens');
  return inputTokens !== undefined && outputTokens !== undefined
    ? { inputTokens, outputTokens }
    : undefined;
}

type DeltaResult = {
  chunks: ChatStreamChunk[];
  finishReason?: string;
};

function readDelta(payload: JsonRecord): DeltaResult {
  const choices = payload.choices;
  const choice = Array.isArray(choices) ? choices[0] : undefined;
  if (!isRecord(choice)) return { chunks: [] };

  const chunks: ChatStreamChunk[] = [];
  const delta = readRecord(choice, 'delta');
  if (delta) {
    // DeepSeek, Kimi and GLM send `reasoning_content`; OpenRouter and Groq send `reasoning`.
    const reasoning = readString(delta, 'reasoning_content') ?? readString(delta, 'reasoning');
    if (reasoning) chunks.push({ type: 'reasoning', text: reasoning });
    const content = readString(delta, 'content');
    if (content) chunks.push({ type: 'text', text: content });
  }
  return { chunks, finishReason: readString(choice, 'finish_reason') };
}

export function createOpenAICompatibleAdapter({
  providerId,
  baseUrl,
  apiKey,
  fetchImpl = defaultFetch,
}: OpenAICompatibleOptions): ProviderAdapter {
  const headers: Record<string, string> = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  return {
    async listModels(signal) {
      const response = await sendRequest({
        fetchImpl,
        url: joinUrl(baseUrl, 'models'),
        method: 'GET',
        headers,
        signal,
      });
      const body = await readJsonResponse(response, signal);
      const entries = isRecord(body) ? body.data : undefined;
      if (!Array.isArray(entries)) throw new ProviderError('invalidResponse');

      return entries
        .map((entry) => toModelInfo(entry, providerId))
        .filter((model): model is ModelInfo => model !== undefined)
        .sort((a, b) => a.id.localeCompare(b.id));
    },

    async *streamChat({ model, messages, signal }: StreamChatRequest) {
      const response = await sendRequest({
        fetchImpl,
        url: joinUrl(baseUrl, 'chat/completions'),
        method: 'POST',
        headers: { ...headers, Accept: 'text/event-stream' },
        body: { model, messages, stream: true },
        signal,
      });
      if (!response.body) throw new ProviderError('invalidResponse', { status: response.status });

      let finishReason: string | undefined;
      let usage: TokenUsage | undefined;

      for await (const payload of readJsonEvents(response.body, signal, {
        endMarker: doneMarker,
      })) {
        if (payload.error !== undefined) throw errorFromStreamPayload(payload.error);

        const delta = readDelta(payload);
        yield* delta.chunks;
        finishReason = delta.finishReason ?? finishReason;
        usage = readUsage(payload) ?? usage;
      }

      // Some compatible servers close the stream without sending [DONE]; finishing normally
      // keeps the contract of exactly one `done` chunk.
      yield { type: 'done', finishReason, usage };
    },
  };
}
