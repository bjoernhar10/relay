import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChatList } from '../chat-list';

const chat = { id: '1', title: 'Reiseplan Lissabon', updatedAt: new Date() };

describe('ChatList', () => {
  it('renders translated group headers and selects a chat on press', async () => {
    const onSelectChat = jest.fn();
    await render(
      <ChatList sections={[{ group: 'yesterday', data: [chat] }]} onSelectChat={onSelectChat} />,
    );

    expect(screen.getByText('Gestern')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Reiseplan Lissabon'));
    expect(onSelectChat).toHaveBeenCalledWith(chat);
  });
});

describe('ChatList active chat', () => {
  it('marks the open chat as selected', async () => {
    const other = { id: '2', title: 'Anderer Chat', updatedAt: new Date() };
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
});
