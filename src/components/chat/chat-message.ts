export type AssistantMessageStatus = 'streaming' | 'complete';

export type ChatMessage =
  | { id: string; role: 'user'; content: string }
  | {
      id: string;
      role: 'assistant';
      content: string;
      modelLabel: string;
      status: AssistantMessageStatus;
    };

let messageCounter = 0;

export function createMessageId(): string {
  messageCounter += 1;
  return `${Date.now().toString(36)}-${messageCounter}`;
}
