import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { deleteChat, renameChat, setChatArchived, setChatPinned } from '@/db/conversation-commands';

import { ChatActions } from '../chat-actions-sheet';

jest.mock('@/db/conversation-commands', () => ({
  renameChat: jest.fn(() => Promise.resolve()),
  setChatPinned: jest.fn(() => Promise.resolve()),
  setChatArchived: jest.fn(() => Promise.resolve()),
  deleteChat: jest.fn(() => Promise.resolve()),
}));

const chat = { id: 'c1', title: 'Reiseplan', pinned: false, archived: false, updated: '' };

describe('ChatActions', () => {
  it('pins and archives the chat and closes the menu', async () => {
    const close = jest.fn();
    await render(<ChatActions chat={chat} close={close} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Anpinnen' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Archivieren' }));

    expect(setChatPinned).toHaveBeenCalledWith('c1', true);
    expect(setChatArchived).toHaveBeenCalledWith('c1', true);
    expect(close).toHaveBeenCalledTimes(2);
  });

  it('offers unpin and restore for pinned, archived chats', async () => {
    await render(
      <ChatActions chat={{ ...chat, pinned: true, archived: true }} close={jest.fn()} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Nicht mehr anpinnen' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Wiederherstellen' }));

    expect(setChatPinned).toHaveBeenCalledWith('c1', false);
    expect(setChatArchived).toHaveBeenCalledWith('c1', false);
  });

  it('renames the chat', async () => {
    await render(<ChatActions chat={chat} close={jest.fn()} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Umbenennen' }));
    await fireEvent.changeText(screen.getByLabelText('Titel'), '  Lissabon im Mai ');
    await fireEvent.press(screen.getByRole('button', { name: 'Sichern' }));

    expect(renameChat).toHaveBeenCalledWith('c1', 'Lissabon im Mai');
  });

  it('asks before deleting', async () => {
    const alert = jest.spyOn(Alert, 'alert');
    await render(<ChatActions chat={chat} close={jest.fn()} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Löschen' }));

    expect(deleteChat).not.toHaveBeenCalled();
    const buttons = alert.mock.calls[0]?.[2];
    buttons?.find((button) => button.style === 'destructive')?.onPress?.();
    expect(deleteChat).toHaveBeenCalledWith('c1');
  });
});
