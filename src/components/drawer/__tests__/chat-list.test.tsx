import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChatList } from '../chat-list';

const chat = {
  id: '1',
  title: 'Reiseplan Lissabon',
  pinned: false,
  archived: false,
  updated: new Date().toISOString(),
};

describe('ChatList', () => {
  it('renders translated group headers, selects on press and opens the menu on long press', async () => {
    const onSelectChat = jest.fn();
    const onOpenChatMenu = jest.fn();
    await render(
      <ChatList
        sections={[{ group: 'pinned', data: [chat] }]}
        onSelectChat={onSelectChat}
        onOpenChatMenu={onOpenChatMenu}
      />,
    );

    expect(screen.getByText('Angepinnt')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Reiseplan Lissabon'));
    expect(onSelectChat).toHaveBeenCalledWith(chat);

    await fireEvent(screen.getByText('Reiseplan Lissabon'), 'longPress');
    expect(onOpenChatMenu).toHaveBeenCalledWith(chat);
  });

  it('marks the open chat as selected', async () => {
    const other = { ...chat, id: '2', title: 'Anderer Chat' };
    await render(
      <ChatList
        sections={[{ group: 'today', data: [chat, other] }]}
        activeChatId="2"
        onSelectChat={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Anderer Chat', selected: true })).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Reiseplan Lissabon', selected: false }),
    ).toBeOnTheScreen();
  });

  it('shows the empty text when there are no chats', async () => {
    await render(<ChatList sections={[]} onSelectChat={jest.fn()} emptyText="Noch keine Chats" />);

    expect(screen.getByText('Noch keine Chats')).toBeOnTheScreen();
  });
});
