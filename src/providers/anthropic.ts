import type {
  ChatRequestMessage,
  ChatStreamChunk,
  ProviderAdapter,
  StreamChatRequest,
} from './adapter';
import { defaultFetch, joinUrl, readJsonResponse, sendRequest, type FetchLike } from './http';
import { isRecord, readNumber, readPath, readRecord, readString, type JsonRecord } from './json';
import { errorFromStreamPayload, ProviderError } from './provider-error';
import { readJsonEvents } from './sse-json';
import type { ModelInfo } from './types';

type AnthropicOptions = {
  providerId: string;
  baseUrl: string;
  apiKey: string | null;
  fetchImpl?: FetchLike;
};

// 2023-06-01 is still accepted by Anthropic and is what Anthropic-compatible endpoints
// (DeepSeek, Kimi, Z.ai) expect. 2026-10-21 only removes request fields Relay never sends.
export const anthropicApiVersion = '2023-06-01';

// max_tokens is mandatory. Unknown models get a value every current Claude model accepts;
// known ones use their reported cap, limited so a single reply stays reasonable.
const fallbackMaxTokens = 8192;
const maxTokensCeiling = 64000;
const modelsPageSize = 1000;

function readAdaptiveThinkingSupport(entry: JsonRecord): boolean | undefined {
  const supported = readPath(entry, ['capabilities', 'thinking', 'types', 'adaptive', 'supported']);
  return typeof supported === 'boolean' ? supported : undefined;
}

function toModelInfo(entry: unknown, providerId: string): ModelInfo | undefined {
  if (!isRecord(entry)) return undefined;
  const id = readString(entry, 'id');
  if (!id) return undefined;
  return {
    id,
    providerId,
    displayName: readString(entry, 'display_name'),
    contextWindow: readNumber(entry, 'max_input_tokens'),
    maxOutputTokens: readNumber(entry, 'max_tokens'),
    supportsAdaptiveThinking: readAdaptiveThinkingSupport(entry),
    source: 'api',
  };
}

type AnthropicMessage = { role: 'user' | 'assistant'; content: string };

// Anthropic takes the system prompt as its own field, and the conversation has to open with a user turn.
export function toAnthropicRequest(messages: ChatRequestMessage[]) {
  const system = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n');
  const turns = messages.filter(
    (message): message is AnthropicMessage => message.role !== 'system',
  );
  const firstUserTurn = turns.findIndex((message) => message.role === 'user');
  return {
    system: system || undefined,
    messages: firstUserTurn === -1 ? [] : turns.slice(firstUserTurn),
  };
}

function maxTokensFor(modelInfo: ModelInfo | undefined): number {
  return modelInfo?.maxOutputTokens
    ? Math.min(modelInfo.maxOutputTokens, maxTokensCeiling)
    : fallbackMaxTokens;
}

// Only models known to support adaptive thinking get the parameter: older ones reject it with a 400.
// "summarized" is needed because current models stream empty thinking text by default.
function thinkingFor(modelInfo: ModelInfo | undefined) {
  return modelInfo?.supportsAdaptiveThinking
    ? { type: 'adaptive', display: 'summarized' }
    : undefined;
}

type StreamState = {
  finishReason?: string;
  inputTokens?: number;
  outputTokens?: number;
};

function contentChunk(
  blockType: string | undefined,
  text: string | undefined,
  thinking: string | undefined,
): ChatStreamChunk[] {
  if (blockType === 'text' && text) return [{ type: 'text', text }];
  if (blockType === 'thinking' && thinking) return [{ type: 'reasoning', text: thinking }];
  return [];
}

export function chunksFromEvent(payload: JsonRecord, state: StreamState): ChatStreamChunk[] {
  switch (readString(payload, 'type')) {
    case 'message_start': {
      const usage = readRecord(readRecord(payload, 'message') ?? {}, 'usage');
      state.inputTokens = usage ? readNumber(usage, 'input_tokens') : undefined;
      return [];
    }
    case 'content_block_start': {
      // Blocks usually start empty, but a non-empty start must not be lost.
      const block = readRecord(payload, 'content_block');
      if (!block) return [];
      return contentChunk(
        readString(block, 'type'),
        readString(block, 'text'),
        readString(block, 'thinking'),
      );
    }
    case 'content_block_delta': {
      // signature_delta, input_json_delta and citations_delta carry nothing to display.
      const delta = readRecord(payload, 'delta');
      if (!delta) return [];
      const type = readString(delta, 'type');
      return contentChunk(
        type === 'text_delta' ? 'text' : type === 'thinking_delta' ? 'thinking' : type,
        readString(delta, 'text'),
        readString(delta, 'thinking'),
      );
    }
    case 'message_delta': {
      const delta = readRecord(payload, 'delta');
      state.finishReason = (delta && readString(delta, 'stop_reason')) ?? state.finishReason;
      const usage = readRecord(payload, 'usage');
      state.outputTokens = (usage && readNumber(usage, 'output_tokens')) ?? state.outputTokens;
      return [];
    }
    case 'error':
      throw errorFromStreamPayload(payload.error);
    default:
      // ping, content_block_stop and event types added later need no handling.
      return [];
  }
}

function doneChunk({ finishReason, inputTokens, outputTokens }: StreamState): ChatStreamChunk {
  return {
    type: 'done',
    finishReason,
    usage:
      inputTokens !== undefined && outputTokens !== undefined
        ? { inputTokens, outputTokens }
        : undefined,
  };
}

export function createAnthropicAdapter({
  providerId,
  baseUrl,
  apiKey,
  fetchImpl = defaultFetch,
}: AnthropicOptions): ProviderAdapter {
  const headers: Record<string, string> = {
    'anthropic-version': anthropicApiVersion,
    ...(apiKey ? { 'x-api-key': apiKey } : {}),
  };

  return {
    async listModels(signal) {
      const models: ModelInfo[] = [];
      let afterId: string | undefined;

      do {
        const query = `limit=${modelsPageSize}${afterId ? `&after_id=${encodeURIComponent(afterId)}` : ''}`;
        const response = await sendRequest({
          fetchImpl,
          url: `${joinUrl(baseUrl, 'models')}?${query}`,
          method: 'GET',
          headers,
          signal,
        });
        const body = await readJsonResponse(response, signal);
        if (!isRecord(body) || !Array.isArray(body.data)) {
          throw new ProviderError('invalidResponse');
        }
        for (const entry of body.data) {
          const model = toModelInfo(entry, providerId);
          if (model) models.push(model);
        }
        const lastId = readString(body, 'last_id');
        afterId = body.has_more === true && lastId && lastId !== afterId ? lastId : undefined;
      } while (afterId);

      // The API lists newest first, which is the most useful order for picking a model.
      return models;
    },

    async *streamChat({ model, messages, modelInfo, signal }: StreamChatRequest) {
      const { system, messages: turns } = toAnthropicRequest(messages);
      const response = await sendRequest({
        fetchImpl,
        url: joinUrl(baseUrl, 'messages'),
        method: 'POST',
        headers: { ...headers, Accept: 'text/event-stream' },
        body: {
          model,
          max_tokens: maxTokensFor(modelInfo),
          system,
          messages: turns,
          thinking: thinkingFor(modelInfo),
          stream: true,
        },
        signal,
      });
      if (!response.body) throw new ProviderError('invalidResponse', { status: response.status });

      const state: StreamState = {};
      for await (const payload of readJsonEvents(response.body, signal)) {
        if (readString(payload, 'type') === 'message_stop') break;
        yield* chunksFromEvent(payload, state);
      }
      yield doneChunk(state);
    },
  };
}
