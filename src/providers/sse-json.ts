import { isRecord, parseJson, type JsonRecord } from './json';
import { ProviderError } from './provider-error';
import { readSseEvents } from './sse-stream';

type JsonEventOptions = {
  // OpenAI-compatible servers end the stream with a plain-text marker instead of JSON.
  endMarker?: string;
};

// Yields each event's JSON payload. Empty events are skipped; anything that is not a JSON
// object means the stream cannot be trusted and fails as an invalid response.
export async function* readJsonEvents(
  body: ReadableStream<Uint8Array>,
  signal: AbortSignal | undefined,
  { endMarker }: JsonEventOptions = {},
): AsyncGenerator<JsonRecord> {
  for await (const event of readSseEvents(body, signal)) {
    if (endMarker !== undefined && event.data === endMarker) return;
    if (!event.data.trim()) continue;
    const payload = parseJson(event.data);
    if (!isRecord(payload)) throw new ProviderError('invalidResponse');
    yield payload;
  }
}
