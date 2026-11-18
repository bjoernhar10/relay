import { readSseEvents } from '../sse-stream';

function streamOf(chunks: Uint8Array[], onCancel = jest.fn()) {
  let index = 0;
  return {
    stream: new ReadableStream<Uint8Array>({
      pull(controller) {
        const chunk = chunks[index];
        index += 1;
        if (chunk) controller.enqueue(chunk);
        else controller.close();
      },
      cancel: onCancel,
    }),
    onCancel,
  };
}

async function collect(iterable: AsyncIterable<{ data: string }>) {
  const data: string[] = [];
  for await (const event of iterable) data.push(event.data);
  return data;
}

describe('readSseEvents', () => {
  it('decodes multi-byte characters split across chunks', async () => {
    const bytes = new TextEncoder().encode('data: Grüße 👋\n\n');
    const splitInsideEmoji = bytes.length - 4;
    const { stream } = streamOf([bytes.slice(0, splitInsideEmoji), bytes.slice(splitInsideEmoji)]);

    expect(await collect(readSseEvents(stream))).toEqual(['Grüße 👋']);
  });

  it('cancels the connection when the consumer stops early', async () => {
    const encoder = new TextEncoder();
    const { stream, onCancel } = streamOf([
      encoder.encode('data: one\n\n'),
      encoder.encode('data: two\n\n'),
    ]);

    for await (const event of readSseEvents(stream)) {
      expect(event.data).toBe('one');
      break;
    }

    expect(onCancel).toHaveBeenCalled();
  });

  it('reports a dropped connection as a network error', async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new TypeError('connection reset'));
      },
    });

    await expect(collect(readSseEvents(stream))).rejects.toMatchObject({ kind: 'network' });
  });
});
