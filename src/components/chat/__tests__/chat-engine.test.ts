import { waitFor } from '@testing-library/react-native';
import { createTestDatabase } from '@test-utils/test-database';

import { getConversation } from '@/db/conversations-repository';
import type { Database } from '@/db/database';
import { listMessages } from '@/db/messages-repository';
import type { ChatStreamChunk, StreamChatRequest } from '@/providers/adapter';
import { createProviderAdapter } from '@/providers/create-adapter';
import { ProviderError } from '@/providers/provider-error';
import { useModelStore } from '@/store/model-store';
import { useProviderStore } from '@/store/provider-store';

import { regenerateReply, sendMessage, stopReply } from '../chat-engine';

let mockDatabase: Database;

jest.mock('@/db/database', () => ({
  ...jest.requireActual('@/db/database'),
  getDatabase: () => Promise.resolve(mockDatabase),
}));
jest.mock('@/providers/create-adapter', () => ({ createProviderAdapter: jest.fn() }));

type Script = (request: StreamChatRequest, call: number) => AsyncGenerator<ChatStreamChunk>;

function useAdapter(script: Script) {
  const requests: StreamChatRequest[] = [];
  jest.mocked(createProviderAdapter).mockResolvedValue({
    listModels: jest.fn(),
    streamChat: (request) => {
      requests.push(request);
      return script(request, requests.length);
    },
  });
  return requests;
}

const isTitleRequest = (request: StreamChatRequest) => request.messages[0]?.role === 'system';

beforeEach(async () => {
  mockDatabase = await createTestDatabase();
  useProviderStore.setState({
    providers: [
      {
        id: 'p1',
        name: 'Test',
        baseUrl: 'https://api.example.com/v1',
        protocol: 'openai-compatible',
        hasApiKey: true,
        createdAt: 0,
        updatedAt: 0,
      },
    ],
  });
  useModelStore.setState({ selected: { providerId: 'p1', modelId: 'model-a', label: 'Model A' } });
});

describe('chat engine', () => {
  it('creates the chat, stores the streamed reply and then generates a title', async () => {
    const requests = useAdapter(async function* (request) {
      if (isTitleRequest(request)) {
        yield { type: 'reasoning', text: 'ignoriert' };
        yield { type: 'text', text: '"Sauerteigbrot backen."' };
        return;
      }
      yield { type: 'reasoning', text: 'Überlege' };
      yield { type: 'text', text: 'Mehl, ' };
      yield { type: 'text', text: 'Wasser, Salz.' };
    });

    const { conversationId, reply } = await sendMessage(null, 'Wie backe ich Sauerteigbrot?');
    expect((await getConversation(mockDatabase, conversationId))?.title).toBe(
      'Wie backe ich Sauerteigbrot?',
    );
    await reply;

    expect(await listMessages(mockDatabase, conversationId)).toEqual([
      expect.objectContaining({ role: 'user', content: 'Wie backe ich Sauerteigbrot?' }),
      expect.objectContaining({
        role: 'assistant',
        content: 'Mehl, Wasser, Salz.',
        reasoning: 'Überlege',
        status: 'complete',
        modelLabel: 'Model A',
      }),
    ]);
    expect(await getConversation(mockDatabase, conversationId)).toMatchObject({
      title: 'Sauerteigbrot backen',
      titleSource: 'generated',
      providerId: 'p1',
      modelId: 'model-a',
    });
    expect(requests[0]?.messages).toEqual([
      { role: 'user', content: 'Wie backe ich Sauerteigbrot?' },
    ]);
    expect(requests[1]?.messages[1]?.content).toContain('Mehl, Wasser, Salz.');
  });

  it('continues an existing chat with the full history', async () => {
    const requests = useAdapter(async function* (request) {
      if (!isTitleRequest(request)) yield { type: 'text', text: 'Antwort' };
    });
    const first = await sendMessage(null, 'Frage 1');
    await first.reply;

    const second = await sendMessage(first.conversationId, 'Frage 2');
    await second.reply;

    const chatRequests = requests.filter((request) => !isTitleRequest(request));
    expect(chatRequests[1]?.messages).toEqual([
      { role: 'user', content: 'Frage 1' },
      { role: 'assistant', content: 'Antwort' },
      { role: 'user', content: 'Frage 2' },
    ]);
    expect(await listMessages(mockDatabase, first.conversationId)).toHaveLength(4);
  });

  it('stops a reply, keeps what arrived and skips the title', async () => {
    useAdapter(async function* (request) {
      yield { type: 'text', text: 'Anfang' };
      await new Promise<never>((_, reject) =>
        request.signal?.addEventListener('abort', () => reject(new ProviderError('aborted'))),
      );
    });

    const { conversationId, reply } = await sendMessage(null, 'Erzähl was');
    await waitFor(async () =>
      expect((await listMessages(mockDatabase, conversationId))[1]?.content).toBe('Anfang'),
    );
    stopReply(conversationId);
    await reply;

    expect((await listMessages(mockDatabase, conversationId))[1]).toMatchObject({
      content: 'Anfang',
      status: 'stopped',
    });
    expect((await getConversation(mockDatabase, conversationId))?.titleSource).toBe('provisional');
  });

  it('stores errors and replaces the failed reply when regenerating', async () => {
    let call = 0;
    useAdapter(async function* (request) {
      if (isTitleRequest(request)) throw new ProviderError('server');
      call += 1;
      if (call === 1) throw new ProviderError('rateLimited', { detail: 'slow down' });
      yield { type: 'text', text: 'Jetzt klappt es' };
    });

    const { conversationId, reply } = await sendMessage(null, 'Hallo');
    await reply;
    const [, failed] = await listMessages(mockDatabase, conversationId);
    expect(failed).toMatchObject({
      status: 'error',
      errorKind: 'rateLimited',
      errorDetail: 'slow down',
    });

    await regenerateReply(conversationId, failed!.id);

    const messages = await listMessages(mockDatabase, conversationId);
    expect(messages).toHaveLength(2);
    expect(messages[1]).toMatchObject({ content: 'Jetzt klappt es', status: 'complete' });
    // A failed title request keeps the provisional title.
    expect((await getConversation(mockDatabase, conversationId))?.title).toBe('Hallo');
  });

  it('records a missing model as an error without calling a provider', async () => {
    useModelStore.setState({ selected: null });
    const requests = useAdapter(async function* () {});

    const { conversationId, reply } = await sendMessage(null, 'Hallo');
    await reply;

    expect((await listMessages(mockDatabase, conversationId))[1]).toMatchObject({
      status: 'error',
      errorKind: 'missingModel',
    });
    expect(requests).toHaveLength(0);
  });
});
