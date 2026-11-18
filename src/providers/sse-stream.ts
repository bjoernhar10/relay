import { errorFromRequestFailure } from './provider-error';
import { createSseParser, type SseEvent } from './sse-parser';

// Decodes the byte stream incrementally (multi-byte characters may span chunks) and yields
// complete events. Stopping the iteration early cancels the underlying connection.
export async function* readSseEvents(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const parser = createSseParser();
  let finished = false;

  try {
    while (true) {
      let result: ReadableStreamReadResult<Uint8Array>;
      try {
        result = await reader.read();
      } catch (error) {
        throw errorFromRequestFailure(error, signal);
      }
      if (result.done) break;
      yield* parser.push(decoder.decode(result.value, { stream: true }));
    }
    finished = true;
    yield* parser.push(decoder.decode());
    yield* parser.end();
  } finally {
    if (!finished) await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
