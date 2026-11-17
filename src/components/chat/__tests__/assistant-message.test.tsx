import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { AssistantMessage } from '../assistant-message';

describe('AssistantMessage', () => {
  it('shows the model badge and copies the raw markdown', async () => {
    await render(<AssistantMessage content="Eine **Antwort**" modelLabel="test-model" />);

    expect(screen.getByText('test-model')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Neu generieren' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Kopieren' }));

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Eine **Antwort**');
    expect(screen.getByRole('button', { name: 'Kopiert' })).toBeOnTheScreen();
  });
});

describe('AssistantMessage while streaming', () => {
  it('hides the actions until the reply is complete', async () => {
    await render(<AssistantMessage content="Teil" modelLabel="test-model" isStreaming />);

    expect(screen.queryByRole('button', { name: 'Kopieren' })).not.toBeOnTheScreen();
    expect(screen.queryByText('test-model')).not.toBeOnTheScreen();
  });
});
