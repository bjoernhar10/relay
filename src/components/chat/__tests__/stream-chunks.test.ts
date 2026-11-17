import { splitIntoStreamChunks } from '../stream-chunks';

describe('splitIntoStreamChunks', () => {
  it('splits into words and restores the exact text when joined', () => {
    const text = 'Hallo Welt\n\n```ts\n  const a = 1;\n```\n';
    const chunks = splitIntoStreamChunks(text);

    expect(chunks.length).toBeGreaterThan(3);
    expect(chunks.join('')).toBe(text);
  });
});
