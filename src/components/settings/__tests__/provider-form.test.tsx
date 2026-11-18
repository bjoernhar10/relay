import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ProviderForm } from '../provider-form';

const emptyDraft = { name: '', baseUrl: '', protocol: 'openai-compatible' as const, apiKey: '' };

describe('ProviderForm', () => {
  it('shows validation errors instead of saving an incomplete provider', async () => {
    const onSave = jest.fn();
    await render(
      <ProviderForm initialDraft={emptyDraft} hasStoredApiKey={false} onSave={onSave} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Sichern' }));

    expect(screen.getAllByText('Pflichtfeld')).toHaveLength(2);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves name, URL, protocol and key', async () => {
    const onSave = jest.fn(() => Promise.resolve());
    await render(
      <ProviderForm initialDraft={emptyDraft} hasStoredApiKey={false} onSave={onSave} />,
    );

    await fireEvent.changeText(screen.getByLabelText('Name'), 'Mein Server');
    await fireEvent.changeText(screen.getByLabelText('Base-URL'), 'https://llm.example.com/v1');
    await fireEvent.press(screen.getByRole('radio', { name: 'Anthropic' }));
    await fireEvent.changeText(screen.getByLabelText('API-Key'), 'secret');
    await fireEvent.press(screen.getByRole('button', { name: 'Sichern' }));

    expect(onSave).toHaveBeenCalledWith(
      {
        name: 'Mein Server',
        baseUrl: 'https://llm.example.com/v1',
        protocol: 'anthropic',
        apiKey: 'secret',
      },
      { removeApiKey: false },
    );
  });

  it('never shows a stored key and can mark it for removal', async () => {
    const onSave = jest.fn(() => Promise.resolve());
    await render(
      <ProviderForm
        initialDraft={{ ...emptyDraft, name: 'OpenAI', baseUrl: 'https://api.openai.com/v1' }}
        hasStoredApiKey
        onSave={onSave}
        onDelete={jest.fn()}
      />,
    );

    const keyField = screen.getByLabelText('API-Key');
    expect(keyField).toHaveDisplayValue('');
    expect(keyField.props.placeholder).toBe('Gespeichert, leer lassen zum Behalten');

    await fireEvent.press(screen.getByRole('button', { name: 'Key entfernen' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Sichern' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ apiKey: '' }), {
      removeApiKey: true,
    });
    expect(screen.getByRole('button', { name: 'Anbieter löschen' })).toBeOnTheScreen();
  });

  it('shows an error when saving fails', async () => {
    const onSave = jest.fn(() => Promise.reject(new Error('keychain locked')));
    await render(
      <ProviderForm
        initialDraft={{ ...emptyDraft, name: 'X', baseUrl: 'https://x.example.com' }}
        hasStoredApiKey={false}
        onSave={onSave}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Sichern' }));

    await waitFor(() =>
      expect(
        screen.getByText('Konnte nicht gespeichert werden. Bitte erneut versuchen.'),
      ).toBeOnTheScreen(),
    );
  });
});
