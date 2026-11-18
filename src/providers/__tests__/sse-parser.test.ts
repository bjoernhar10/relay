import { createSseParser, type SseEvent } from '../sse-parser';

function parseChunks(chunks: string[]): SseEvent[] {
  const parser = createSseParser();
  return [...chunks.flatMap((chunk) => parser.push(chunk)), ...parser.end()];
}

const message = (data: string, extra: Partial<SseEvent> = {}): SseEvent => ({
  event: 'message',
  data,
  id: undefined,
  ...extra,
});

describe('createSseParser', () => {
  it('parses complete events', () => {
    expect(parseChunks(['data: one\n\ndata: two\n\n'])).toEqual([message('one'), message('two')]);
  });

  it('reassembles events split at arbitrary positions', () => {
    const stream = 'data: {"a":1}\n\ndata: {"b":2}\n\n';
    for (let split = 1; split < stream.length; split += 1) {
      expect(parseChunks([stream.slice(0, split), stream.slice(split)])).toEqual([
        message('{"a":1}'),
        message('{"b":2}'),
      ]);
    }
  });

  it('handles every character arriving in its own chunk', () => {
    expect(parseChunks([...'event: delta\ndata: x\n\n'])).toEqual([
      message('x', { event: 'delta' }),
    ]);
  });

  it('treats \\r\\n split across chunks as a single line ending', () => {
    expect(parseChunks(['data: a\r', '\n\r', '\ndata: b\r\n\r\n'])).toEqual([
      message('a'),
      message('b'),
    ]);
  });

  it('accepts bare \\r line endings', () => {
    expect(parseChunks(['data: a\r\rdata: b\r\r'])).toEqual([message('a'), message('b')]);
  });

  it('ignores keepalive comments', () => {
    expect(
      parseChunks([': ping\n\n', ':keepalive\ndata: real\n\n', ': OPENROUTER PROCESSING\n\n']),
    ).toEqual([message('real')]);
  });

  it('joins multiple data lines with newlines', () => {
    expect(parseChunks(['data: first\ndata: second\ndata:\n\n'])).toEqual([
      message('first\nsecond\n'),
    ]);
  });

  it('reads event and id fields and strips only one leading space', () => {
    expect(parseChunks(['id: 7\nevent: update\ndata:  two spaces\n\n'])).toEqual([
      { event: 'update', data: ' two spaces', id: '7' },
    ]);
  });

  it('accepts fields without a space after the colon and ignores unknown fields', () => {
    expect(parseChunks(['data:compact\nretry: 1000\nfoo\n\n'])).toEqual([message('compact')]);
  });

  it('removes a byte order mark at the start of the stream only', () => {
    expect(parseChunks(['﻿data: a\n\n', 'data: ﻿b\n\n'])).toEqual([message('a'), message('﻿b')]);
  });

  it('passes [DONE] through as data for the adapter to handle', () => {
    expect(parseChunks(['data: [DONE]\n\n'])).toEqual([message('[DONE]')]);
  });

  it('does not dispatch events without data', () => {
    expect(parseChunks(['event: ping\n\n\n\n'])).toEqual([]);
  });

  it('keeps an unterminated final event when the stream ends', () => {
    expect(parseChunks(['data: last words'])).toEqual([message('last words')]);
  });
});
