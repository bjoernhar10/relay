import { useEffect, useRef, useState } from 'react';

import { createMessageId, type ChatMessage } from './chat-message';
import { selectedModelLabel } from '@/components/model-picker/selected-model-label';
import { useModelStore } from '@/store/model-store';

import { dummyStreamedReply } from './dummy-conversation';
import { splitIntoStreamChunks } from './stream-chunks';

const streamTickMs = 40;

function completeStreamingMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) =>
    message.role === 'assistant' && message.status === 'streaming'
      ? { ...message, status: 'complete' }
      : message,
  );
}

export function useChatSession(initialMessages: ChatMessage[]) {
  const [messages, setMessages] = useState(initialMessages);
  const streamTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const sentMessageIds = useRef(new Set<string>());

  const lastMessage = messages.at(-1);
  const isResponding = lastMessage?.role === 'assistant' && lastMessage.status === 'streaming';

  const stop = () => {
    clearInterval(streamTimer.current);
    streamTimer.current = undefined;
    setMessages(completeStreamingMessages);
  };

  useEffect(() => () => clearInterval(streamTimer.current), []);

  const send = (text: string) => {
    if (streamTimer.current) return;

    const userMessageId = createMessageId();
    const replyId = createMessageId();
    sentMessageIds.current.add(userMessageId);
    setMessages((current) => [
      ...current,
      { id: userMessageId, role: 'user', content: text },
      {
        id: replyId,
        role: 'assistant',
        content: '',
        modelLabel: selectedModelLabel(useModelStore.getState().selectedModelId),
        status: 'streaming',
      },
    ]);

    const chunks = splitIntoStreamChunks(dummyStreamedReply);
    let streamedChunks = 0;
    streamTimer.current = setInterval(() => {
      streamedChunks += 1;
      const content = chunks.slice(0, streamedChunks).join('');
      setMessages((current) =>
        current.map((message) => (message.id === replyId ? { ...message, content } : message)),
      );
      if (streamedChunks >= chunks.length) stop();
    }, streamTickMs);
  };

  const isSentInSession = (messageId: string) => sentMessageIds.current.has(messageId);

  return { messages, isResponding, send, stop, isSentInSession };
}
