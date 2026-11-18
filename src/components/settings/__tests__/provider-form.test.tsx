import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ProviderError } from '@/providers/provider-error';

import { ProviderForm } from '../provider-form';

const emptyDraft = { name: '', baseUrl: '', protocol: 'openai-compatible' as const, apiKey: '' };

describe('ProviderForm', () => {
  it('shows validation errors instead of saving an incomplete provider', async () => {
    const onSave = jest.fn();
    await render(
      <ProviderForm
        initialDraft={emptyDraft}
        hasStoredApiKey={false}
        onSave={onSave}
        onTestConnection={jest.fn()}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Sichern' }));

    expect(screen.getAllByText('Pflichtfeld')).toHaveLength(2);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves name, URL, protocol and key', async () => {
    const onSave = jest.fn(() => Promise.resolve());
    await render(
      <ProviderForm
        initialDraft={emptyDraft}
        hasStoredApiKey={false}
        onSave={onSave}
        onTestConnection={jest.fn()}
      />,
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
        onTestConnection={jest.fn()}
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
        onTestConnection={jest.fn()}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Sichern' }));

    await waitFor(() =>
      expect(
        screen.getByText('Konnte nicht gespeichert werden. Bitte erneut versuchen.'),
      ).toBeOnTheScreen(),
    );
  });

  it('tests the key with the current form values', async () => {
    const onTestConnection = jest.fn(() => Promise.resolve(42));
    await render(
      <ProviderForm
        initialDraft={{ ...emptyDraft, name: 'OpenAI', baseUrl: 'https://api.openai.com/v1' }}
        hasStoredApiKey
        onSave={jest.fn()}
        onTestConnection={onTestConnection}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Key testen' }));

    expect(onTestConnection).toHaveBeenCalledWith(
      expect.objectContaining({ baseUrl: 'https://api.openai.com/v1' }),
      { useStoredKey: true },
    );
    expect(await screen.findByText('Verbunden, 42 Modelle gefunden')).toBeOnTheScreen();
  });

  it('shows why a key test failed', async () => {
    const onTestConnection = jest.fn(() => Promise.reject(new ProviderError('invalidApiKey')));
    await render(
      <ProviderForm
        initialDraft={{ ...emptyDraft, name: 'X', baseUrl: 'https://x.example.com' }}
        hasStoredApiKey={false}
        onSave={jest.fn()}
        onTestConnection={onTestConnection}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Key testen' }));

    expect(
      await screen.findByText('Der API-Key wurde abgelehnt. Prüfe ihn in den Einstellungen.'),
    ).toBeOnTheScreen();
  });

  it('does not test an invalid URL', async () => {
    const onTestConnection = jest.fn();
    await render(
      <ProviderForm
        initialDraft={{ ...emptyDraft, name: 'X', baseUrl: 'kaputt' }}
        hasStoredApiKey={false}
        onSave={jest.fn()}
        onTestConnection={onTestConnection}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Key testen' }));

    expect(onTestConnection).not.toHaveBeenCalled();
    expect(screen.getByText('Keine gültige URL (http oder https)')).toBeOnTheScreen();
  });
});
