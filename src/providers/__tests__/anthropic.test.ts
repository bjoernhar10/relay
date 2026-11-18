import type { ChatStreamChunk } from '../adapter';
import {
  anthropicApiVersion,
  chunksFromEvent,
  createAnthropicAdapter,
  toAnthropicRequest,
} from '../anthropic';
import type { FetchLike, HttpResponse } from '../http';
import type { ModelInfo } from '../types';

function sseBody(chunks: string[]) {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      const chunk = chunks[index];
      index += 1;
      if (chunk === undefined) controller.close();
      else controller.enqueue(encoder.encode(chunk));
    },
  });
}

function response(
  status: number,
  text: string,
  headers: Record<string, string> = {},
): HttpResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    body: null,
    text: () => Promise.resolve(text),
  };
}

const streamResponse = (chunks: string[]): HttpResponse => ({
  ...response(200, ''),
  body: sseBody(chunks),
});

const event = (payload: { type: string } & Record<string, unknown>) =>
  `event: ${payload.type}\ndata: ${JSON.stringify(payload)}\n\n`;

const messageStart = event({
  type: 'message_start',
  message: {
    id: 'msg_1',
    type: 'message',
    role: 'assistant',
    content: [],
    usage: { input_tokens: 12 },
  },
});
const blockStart = (index: number, block: Record<string, unknown>) =>
  event({ type: 'content_block_start', index, content_block: block });
const delta = (index: number, value: Record<string, unknown>) =>
  event({ type: 'content_block_delta', index, delta: value });
const blockStop = (index: number) => event({ type: 'content_block_stop', index });
const messageDelta = event({
  type: 'message_delta',
  delta: { stop_reason: 'end_turn', stop_sequence: null },
  usage: { output_tokens: 34 },
});
const messageStop = event({ type: 'message_stop' });

async function collect(chunks: AsyncIterable<ChatStreamChunk>) {
  const result: ChatStreamChunk[] = [];
  for await (const chunk of chunks) result.push(chunk);
  return result;
}

type FetchMock = jest.Mock<ReturnType<FetchLike>, Parameters<FetchLike>>;

function adapterWith(fetchImpl: FetchLike, apiKey: string | null = 'sk-ant-test') {
  return createAnthropicAdapter({
    providerId: 'p1',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKey,
    fetchImpl,
  });
}

const request = { model: 'claude-test', messages: [{ role: 'user' as const, content: 'Hallo' }] };

describe('chunksFromEvent', () => {
  it('turns text and thinking deltas into chunks and ignores signatures and tool input', () => {
    const state = {};
    const parse = (payload: Record<string, unknown>) => chunksFromEvent(payload, state);

    expect(
      parse({ type: 'content_block_delta', delta: { type: 'thinking_delta', thinking: 'Hm' } }),
    ).toEqual([{ type: 'reasoning', text: 'Hm' }]);
    expect(
      parse({ type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hi' } }),
    ).toEqual([{ type: 'text', text: 'Hi' }]);
    expect(
      parse({ type: 'content_block_delta', delta: { type: 'signature_delta', signature: 'abc' } }),
    ).toEqual([]);
    expect(
      parse({
        type: 'content_block_delta',
        delta: { type: 'input_json_delta', partial_json: '{' },
      }),
    ).toEqual([]);
  });

  it('keeps text from a non-empty block start and skips redacted thinking', () => {
    const state = {};
    expect(
      chunksFromEvent(
        { type: 'content_block_start', content_block: { type: 'text', text: 'Start' } },
        state,
      ),
    ).toEqual([{ type: 'text', text: 'Start' }]);
    expect(
      chunksFromEvent(
        { type: 'content_block_start', content_block: { type: 'redacted_thinking', data: 'x' } },
        state,
      ),
    ).toEqual([]);
  });

  it('ignores ping, block stops and unknown future events', () => {
    for (const type of ['ping', 'content_block_stop', 'some_new_event']) {
      expect(chunksFromEvent({ type }, {})).toEqual([]);
    }
  });

  it('collects stop reason and usage', () => {
    const state = {};
    chunksFromEvent({ type: 'message_start', message: { usage: { input_tokens: 5 } } }, state);
    chunksFromEvent(
      { type: 'message_delta', delta: { stop_reason: 'max_tokens' }, usage: { output_tokens: 9 } },
      state,
    );
    expect(state).toEqual({ inputTokens: 5, outputTokens: 9, finishReason: 'max_tokens' });
  });

  it.each([
    ['overloaded_error', 'server'],
    ['api_error', 'server'],
    ['rate_limit_error', 'rateLimited'],
    ['authentication_error', 'invalidApiKey'],
    ['billing_error', 'quotaExceeded'],
    ['invalid_request_error', 'badRequest'],
  ])('maps a %s stream event to %s', (type, kind) => {
    expect(() =>
      chunksFromEvent({ type: 'error', error: { type, message: 'Overloaded' } }, {}),
    ).toThrow(expect.objectContaining({ kind, detail: 'Overloaded' }));
  });
});

describe('toAnthropicRequest', () => {
  it('moves system messages into the system field and starts with a user turn', () => {
    expect(
      toAnthropicRequest([
        { role: 'system', content: 'Sei knapp.' },
        { role: 'assistant', content: 'Verwaiste Antwort' },
        { role: 'user', content: 'Frage' },
        { role: 'system', content: 'Antworte auf Deutsch.' },
        { role: 'assistant', content: 'Antwort' },
      ]),
    ).toEqual({
      system: 'Sei knapp.\n\nAntworte auf Deutsch.',
      messages: [
        { role: 'user', content: 'Frage' },
        { role: 'assistant', content: 'Antwort' },
      ],
    });
    expect(toAnthropicRequest([{ role: 'user', content: 'x' }]).system).toBeUndefined();
  });
});

describe('Anthropic adapter', () => {
  describe('streamChat', () => {
    it('streams thinking and text with the Anthropic headers and ends with done', async () => {
      const fetchImpl: FetchMock = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
        streamResponse([
          messageStart,
          blockStart(0, { type: 'thinking', thinking: '', signature: '' }),
          delta(0, { type: 'thinking_delta', thinking: 'Kurz ' }),
          delta(0, { type: 'thinking_delta', thinking: 'nachdenken' }),
          delta(0, { type: 'signature_delta', signature: 'EqQBCgIYAhIM' }),
          blockStop(0),
          'event: ping\ndata: {"type": "ping"}\n\n',
          blockStart(1, { type: 'text', text: '' }),
          delta(1, { type: 'text_delta', text: 'Hal' }).slice(0, 25),
          delta(1, { type: 'text_delta', text: 'Hal' }).slice(25),
          delta(1, { type: 'text_delta', text: 'lo!' }),
          blockStop(1),
          messageDelta,
          messageStop,
        ]),
      );

      const chunks = await collect(adapterWith(fetchImpl).streamChat(request));

      expect(chunks).toEqual([
        { type: 'reasoning', text: 'Kurz ' },
        { type: 'reasoning', text: 'nachdenken' },
        { type: 'text', text: 'Hal' },
        { type: 'text', text: 'lo!' },
        { type: 'done', finishReason: 'end_turn', usage: { inputTokens: 12, outputTokens: 34 } },
      ]);
      const [url, init] = fetchImpl.mock.calls[0]!;
      expect(url).toBe('https://api.anthropic.com/v1/messages');
      expect(init.headers).toEqual({
        'anthropic-version': anthropicApiVersion,
        'x-api-key': 'sk-ant-test',
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      });
    });

    it('sends max_tokens and thinking based on what the model supports', async () => {
      const fetchImpl: FetchMock = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
        streamResponse([messageStop]),
      );
      const adapter = adapterWith(fetchImpl);
      const thinkingModel: ModelInfo = {
        id: 'claude-test',
        providerId: 'p1',
        maxOutputTokens: 128000,
        supportsAdaptiveThinking: true,
        source: 'api',
      };

      await collect(adapter.streamChat({ ...request, modelInfo: thinkingModel }));
      await collect(
        adapter.streamChat({
          ...request,
          modelInfo: { ...thinkingModel, maxOutputTokens: 4096, supportsAdaptiveThinking: false },
        }),
      );
      await collect(adapter.streamChat(request));

      const bodies = fetchImpl.mock.calls.map(([, init]) => JSON.parse(init.body ?? ''));
      expect(bodies[0]).toEqual({
        model: 'claude-test',
        max_tokens: 64000,
        messages: request.messages,
        thinking: { type: 'adaptive', display: 'summarized' },
        stream: true,
      });
      expect(bodies[1]).toMatchObject({ max_tokens: 4096 });
      expect(bodies[1]).not.toHaveProperty('thinking');
      expect(bodies[2]).toMatchObject({ max_tokens: 8192 });
      expect(bodies.every((body) => !('temperature' in body))).toBe(true);
    });

    it('finishes with done when the stream ends without message_stop', async () => {
      const chunks = await collect(
        adapterWith(async () =>
          streamResponse([
            messageStart,
            blockStart(0, { type: 'text', text: '' }),
            delta(0, { type: 'text_delta', text: 'Hi' }),
          ]),
        ).streamChat(request),
      );
      expect(chunks.at(-1)).toEqual({ type: 'done', finishReason: undefined, usage: undefined });
    });

    it('throws error events that arrive mid-stream', async () => {
      const stream = adapterWith(async () =>
        streamResponse([
          messageStart,
          delta(0, { type: 'text_delta', text: 'Teil' }),
          event({ type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }),
        ]),
      ).streamChat(request);

      await expect(collect(stream)).rejects.toMatchObject({ kind: 'server', detail: 'Overloaded' });
    });

    it('maps HTTP errors with Anthropic error bodies', async () => {
      const body = (type: string, message: string) =>
        JSON.stringify({ type: 'error', error: { type, message } });

      await expect(
        collect(
          adapterWith(async () =>
            response(401, body('authentication_error', 'invalid x-api-key')),
          ).streamChat(request),
        ),
      ).rejects.toMatchObject({ kind: 'invalidApiKey', detail: 'invalid x-api-key' });
      await expect(
        collect(
          adapterWith(async () =>
            response(
              429,
              body('rate_limit_error', 'Number of requests has exceeded your rate limit'),
              {
                'retry-after': '30',
              },
            ),
          ).streamChat(request),
        ),
      ).rejects.toMatchObject({ kind: 'rateLimited', retryAfterSeconds: 30 });
      await expect(
        collect(
          adapterWith(async () => response(529, body('overloaded_error', 'Overloaded'))).streamChat(
            request,
          ),
        ),
      ).rejects.toMatchObject({ kind: 'server' });
      await expect(
        collect(
          adapterWith(async () =>
            response(400, body('billing_error', 'Your credit balance is too low')),
          ).streamChat(request),
        ),
      ).rejects.toMatchObject({ kind: 'quotaExceeded' });
    });

    it('reports network failures and aborts', async () => {
      await expect(
        collect(
          adapterWith(async () => {
            throw new TypeError('Network request failed');
          }).streamChat(request),
        ),
      ).rejects.toMatchObject({ kind: 'network' });

      const controller = new AbortController();
      controller.abort();
      await expect(
        collect(
          adapterWith(async () => {
            throw new Error('fetch failed: aborted');
          }).streamChat({ ...request, signal: controller.signal }),
        ),
      ).rejects.toMatchObject({ kind: 'aborted' });
    });
  });

  describe('listModels', () => {
    const model = (id: string, extra: Record<string, unknown> = {}) => ({
      type: 'model',
      id,
      display_name: id.toUpperCase(),
      created_at: '2026-01-01T00:00:00Z',
      ...extra,
    });

    it('reads every page and maps limits and thinking support', async () => {
      const fetchImpl: FetchMock = jest
        .fn<ReturnType<FetchLike>, Parameters<FetchLike>>()
        .mockResolvedValueOnce(
          response(
            200,
            JSON.stringify({
              data: [
                model('claude-new', {
                  max_input_tokens: 1000000,
                  max_tokens: 128000,
                  capabilities: {
                    thinking: {
                      supported: true,
                      types: { adaptive: { supported: true }, enabled: { supported: false } },
                    },
                  },
                }),
              ],
              has_more: true,
              first_id: 'claude-new',
              last_id: 'claude-new',
            }),
          ),
        )
        .mockResolvedValueOnce(
          response(
            200,
            JSON.stringify({ data: [model('claude-old')], has_more: false, last_id: 'claude-old' }),
          ),
        );

      const models = await adapterWith(fetchImpl).listModels();

      expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
        'https://api.anthropic.com/v1/models?limit=1000',
        'https://api.anthropic.com/v1/models?limit=1000&after_id=claude-new',
      ]);
      expect(fetchImpl.mock.calls[0]?.[1].headers).toEqual({
        'anthropic-version': anthropicApiVersion,
        'x-api-key': 'sk-ant-test',
      });
      expect(models).toEqual([
        {
          id: 'claude-new',
          providerId: 'p1',
          displayName: 'CLAUDE-NEW',
          contextWindow: 1000000,
          maxOutputTokens: 128000,
          supportsAdaptiveThinking: true,
          source: 'api',
        },
        {
          id: 'claude-old',
          providerId: 'p1',
          displayName: 'CLAUDE-OLD',
          contextWindow: undefined,
          maxOutputTokens: undefined,
          supportsAdaptiveThinking: undefined,
          source: 'api',
        },
      ]);
    });

    it('stops paging when the server repeats the cursor', async () => {
      const fetchImpl: FetchMock = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
        response(200, JSON.stringify({ data: [model('a')], has_more: true, last_id: 'a' })),
      );

      await adapterWith(fetchImpl).listModels();

      expect(fetchImpl).toHaveBeenCalledTimes(2);
    });

    it('maps a rejected key', async () => {
      await expect(
        adapterWith(async () =>
          response(
            401,
            JSON.stringify({
              type: 'error',
              error: { type: 'authentication_error', message: 'invalid x-api-key' },
            }),
          ),
        ).listModels(),
      ).rejects.toMatchObject({ kind: 'invalidApiKey' });
    });
  });
});
