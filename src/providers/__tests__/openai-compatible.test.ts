import type { ChatStreamChunk } from '../adapter';
import type { FetchLike, HttpResponse } from '../http';
import { createOpenAICompatibleAdapter } from '../openai-compatible';

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

function streamResponse(chunks: string[]): HttpResponse {
  return { ...response(200, ''), body: sseBody(chunks) };
}

const event = (payload: unknown) => `data: ${JSON.stringify(payload)}\n\n`;
const delta = (fields: Record<string, string>, finishReason: string | null = null) =>
  event({ choices: [{ index: 0, delta: fields, finish_reason: finishReason }] });

async function collect(chunks: AsyncIterable<ChatStreamChunk>) {
  const result: ChatStreamChunk[] = [];
  for await (const chunk of chunks) result.push(chunk);
  return result;
}

function adapterWith(fetchImpl: FetchLike, apiKey: string | null = 'sk-test') {
  return createOpenAICompatibleAdapter({
    providerId: 'p1',
    baseUrl: 'https://api.example.com/v1',
    apiKey,
    fetchImpl,
  });
}

const request = { model: 'model-a', messages: [{ role: 'user' as const, content: 'Hallo' }] };

describe('OpenAI-compatible adapter', () => {
  describe('listModels', () => {
    it('loads, maps and sorts models with the API key as bearer token', async () => {
      const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
        response(
          200,
          JSON.stringify({
            data: [
              { id: 'zeta', object: 'model' },
              { id: 'alpha', name: 'Alpha Model', context_length: 128000 },
              { object: 'model' },
            ],
          }),
        ),
      );

      const models = await adapterWith(fetchImpl).listModels();

      expect(fetchImpl).toHaveBeenCalledWith('https://api.example.com/v1/models', {
        method: 'GET',
        headers: { Authorization: 'Bearer sk-test' },
        body: undefined,
        signal: undefined,
      });
      expect(models).toEqual([
        {
          id: 'alpha',
          providerId: 'p1',
          displayName: 'Alpha Model',
          contextWindow: 128000,
          source: 'api',
        },
        {
          id: 'zeta',
          providerId: 'p1',
          displayName: undefined,
          contextWindow: undefined,
          source: 'api',
        },
      ]);
    });

    it('sends no Authorization header without a key', async () => {
      const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
        response(200, JSON.stringify({ data: [] })),
      );

      await adapterWith(fetchImpl, null).listModels();

      expect(fetchImpl.mock.calls[0]?.[1].headers).toEqual({});
    });

    it('maps a rejected key and a malformed body', async () => {
      await expect(
        adapterWith(async () => response(401, '{"error":{"message":"bad key"}}')).listModels(),
      ).rejects.toMatchObject({ kind: 'invalidApiKey', detail: 'bad key' });
      await expect(
        adapterWith(async () => response(200, 'not json')).listModels(),
      ).rejects.toMatchObject({ kind: 'invalidResponse' });
    });
  });

  describe('streamChat', () => {
    it('streams reasoning and text chunks and ends with done', async () => {
      const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
        streamResponse([
          ': keepalive\n\n',
          delta({ role: 'assistant', reasoning_content: 'Denke' }),
          delta({ reasoning_content: ' nach' }),
          delta({ content: 'Hal' }).slice(0, 20),
          delta({ content: 'Hal' }).slice(20),
          delta({ content: 'lo!' }, 'stop'),
          event({ choices: [], usage: { prompt_tokens: 5, completion_tokens: 3 } }),
          'data: [DONE]\n\n',
        ]),
      );

      const chunks = await collect(adapterWith(fetchImpl).streamChat(request));

      expect(chunks).toEqual([
        { type: 'reasoning', text: 'Denke' },
        { type: 'reasoning', text: ' nach' },
        { type: 'text', text: 'Hal' },
        { type: 'text', text: 'lo!' },
        { type: 'done', finishReason: 'stop', usage: { inputTokens: 5, outputTokens: 3 } },
      ]);
      const [url, init] = fetchImpl.mock.calls[0]!;
      expect(url).toBe('https://api.example.com/v1/chat/completions');
      expect(init.headers).toMatchObject({
        Authorization: 'Bearer sk-test',
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      });
      expect(JSON.parse(init.body ?? '')).toEqual({ ...request, stream: true });
    });

    it('accepts the `reasoning` field used by OpenRouter and Groq', async () => {
      const chunks = await collect(
        adapterWith(async () =>
          streamResponse([delta({ reasoning: 'hmm' }), 'data: [DONE]\n\n']),
        ).streamChat(request),
      );
      expect(chunks[0]).toEqual({ type: 'reasoning', text: 'hmm' });
    });

    it('finishes with done when the server closes without [DONE]', async () => {
      const chunks = await collect(
        adapterWith(async () => streamResponse([delta({ content: 'Hi' }, 'length')])).streamChat(
          request,
        ),
      );
      expect(chunks).toEqual([
        { type: 'text', text: 'Hi' },
        { type: 'done', finishReason: 'length', usage: undefined },
      ]);
    });

    it('throws errors that arrive inside the stream', async () => {
      const stream = adapterWith(async () =>
        streamResponse([delta({ content: 'Teil' }), event({ error: { message: 'overloaded' } })]),
      ).streamChat(request);

      await expect(collect(stream)).rejects.toMatchObject({ kind: 'server', detail: 'overloaded' });
    });

    it('maps rate limits with their wait time', async () => {
      const stream = adapterWith(async () =>
        response(429, '{"error":{"message":"slow down"}}', { 'retry-after': '7' }),
      ).streamChat(request);

      await expect(collect(stream)).rejects.toMatchObject({
        kind: 'rateLimited',
        retryAfterSeconds: 7,
      });
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
      const aborting: FetchLike = async (_url, init) => {
        controller.abort();
        throw new Error(`fetch failed: aborted ${String(init.signal?.aborted)}`);
      };
      await expect(
        collect(adapterWith(aborting).streamChat({ ...request, signal: controller.signal })),
      ).rejects.toMatchObject({ kind: 'aborted' });
    });

    it('rejects payloads that are not JSON', async () => {
      await expect(
        collect(adapterWith(async () => streamResponse(['data: {broken\n\n'])).streamChat(request)),
      ).rejects.toMatchObject({ kind: 'invalidResponse' });
    });
  });
});
