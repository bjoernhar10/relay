import type { ChatRequestMessage } from '@/providers/adapter';
import type { ModelRef } from '@/store/model-store';

import { streamReply } from './stream-reply';

const maxTitleLength = 60;
const excerptLength = 1500;

// Instructions to the model, not UI text: the title follows the language of the conversation.
const titleInstruction =
  'Write a short title of at most six words for the conversation below, in the language the user writes in. ' +
  'Reply with the title only: no quotes, no trailing punctuation, no explanation.';

export function provisionalTitle(firstMessage: string): string {
  const singleLine = firstMessage.replace(/\s+/g, ' ').trim();
  return singleLine.length > maxTitleLength
    ? `${singleLine.slice(0, maxTitleLength - 1).trimEnd()}…`
    : singleLine;
}

export function cleanTitle(raw: string): string {
  const firstLine = raw.trim().split('\n')[0] ?? '';
  return firstLine
    .replace(/^(title|titel)\s*:\s*/i, '')
    .replace(/^["'„“”«»*#\s]+|["'„“”«»*\s]+$/g, '')
    .replace(/[.!?:;]+$/, '')
    .slice(0, maxTitleLength)
    .trim();
}

export function titleRequest(userMessage: string, reply: string): ChatRequestMessage[] {
  return [
    { role: 'system', content: titleInstruction },
    {
      role: 'user',
      content: `User: ${userMessage.slice(0, excerptLength)}\n\nAssistant: ${reply.slice(0, excerptLength)}`,
    },
  ];
}

// Reasoning chunks are ignored; only the visible answer becomes the title.
export async function generateTitle(
  model: ModelRef,
  userMessage: string,
  reply: string,
  signal: AbortSignal,
): Promise<string> {
  let text = '';
  await streamReply({
    model,
    messages: titleRequest(userMessage, reply),
    signal,
    onChunk: (chunk) => {
      if (chunk.type === 'text') text += chunk.text;
    },
  });
  return cleanTitle(text);
}
