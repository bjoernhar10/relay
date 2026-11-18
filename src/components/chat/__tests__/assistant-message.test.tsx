import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { ProviderError } from '@/providers/provider-error';

import { AssistantMessage } from '../assistant-message';
import { MissingModelError } from '../missing-model-error';

const complete = {
  content: 'Eine **Antwort**',
  reasoning: '',
  modelLabel: 'test-model',
  status: 'complete' as const,
};

describe('AssistantMessage', () => {
  it('shows the model label, copies the raw markdown and regenerates', async () => {
    const onRegenerate = jest.fn();
    await render(<AssistantMessage message={complete} onRegenerate={onRegenerate} />);

    expect(screen.getByText('test-model')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Kopieren' }));
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Eine **Antwort**');

    await fireEvent.press(screen.getByRole('button', { name: 'Neu generieren' }));
    expect(onRegenerate).toHaveBeenCalled();
  });

  it('hides the actions while streaming', async () => {
    await render(<AssistantMessage message={{ ...complete, status: 'streaming' }} />);

    expect(screen.queryByRole('button', { name: 'Kopieren' })).not.toBeOnTheScreen();
  });

  it('shows reasoning collapsed above the answer and expands it on tap', async () => {
    await render(
      <AssistantMessage message={{ ...complete, reasoning: 'Erst prüfen, dann antworten' }} />,
    );

    const toggle = screen.getByRole('button', { name: 'Gedankengang' });
    expect(screen.queryByText('Erst prüfen, dann antworten')).not.toBeOnTheScreen();

    await fireEvent.press(toggle);

    expect(screen.getByText('Erst prüfen, dann antworten')).toBeOnTheScreen();
    expect(toggle).toBeExpanded();
  });

  it('labels reasoning as thinking until the answer starts', async () => {
    await render(
      <AssistantMessage
        message={{ ...complete, content: '', reasoning: 'Hm', status: 'streaming' }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Denkt nach …' })).toBeOnTheScreen();
  });

  it('shows errors with the provider detail and a retry button', async () => {
    const onRegenerate = jest.fn();
    await render(
      <AssistantMessage
        message={{
          ...complete,
          content: '',
          status: 'error',
          error: new ProviderError('invalidApiKey', { detail: 'Incorrect API key provided' }),
        }}
        onRegenerate={onRegenerate}
      />,
    );

    expect(
      screen.getByText('Der API-Key wurde abgelehnt. Prüfe ihn in den Einstellungen.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Incorrect API key provided')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Kopieren' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Erneut versuchen' }));
    expect(onRegenerate).toHaveBeenCalled();
  });

  it('asks for a model when none was selected', async () => {
    await render(
      <AssistantMessage
        message={{ ...complete, content: '', status: 'error', error: new MissingModelError() }}
      />,
    );

    expect(screen.getByText('Wähle oben zuerst ein Modell aus.')).toBeOnTheScreen();
  });
});
