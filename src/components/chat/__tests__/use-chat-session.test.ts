import { act, renderHook } from '@testing-library/react-native';

import { dummyStreamedReply } from '../dummy-conversation';
import { useChatSession } from '../use-chat-session';

describe('useChatSession', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('adds the user message and streams the reply until it is complete', async () => {
    const { result } = await renderHook(() => useChatSession([]));

    await act(() => result.current.send('Hallo'));

    expect(result.current.isResponding).toBe(true);
    expect(result.current.messages.map((message) => message.role)).toEqual(['user', 'assistant']);
    expect(result.current.messages[0]?.content).toBe('Hallo');

    await act(() => jest.advanceTimersByTime(200));
    const partial = result.current.messages[1]?.content ?? '';
    expect(partial.length).toBeGreaterThan(0);
    expect(dummyStreamedReply.startsWith(partial)).toBe(true);

    await act(() => jest.runOnlyPendingTimers());
    await act(() => jest.advanceTimersByTime(60_000));

    expect(result.current.isResponding).toBe(false);
    expect(result.current.messages[1]).toMatchObject({
      content: dummyStreamedReply,
      status: 'complete',
    });
  });

  it('stops streaming and keeps the partial reply', async () => {
    const { result } = await renderHook(() => useChatSession([]));

    await act(() => result.current.send('Hallo'));
    await act(() => jest.advanceTimersByTime(120));
    await act(() => result.current.stop());
    const stoppedContent = result.current.messages[1]?.content;
    await act(() => jest.advanceTimersByTime(1_000));

    expect(result.current.isResponding).toBe(false);
    expect(result.current.messages[1]).toMatchObject({
      content: stoppedContent,
      status: 'complete',
    });
  });
});
