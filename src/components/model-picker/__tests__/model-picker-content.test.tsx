import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { createProviderAdapter } from '@/providers/create-adapter';
import { ProviderError } from '@/providers/provider-error';
import type { ProviderConfig } from '@/providers/types';
import { useModelStore } from '@/store/model-store';
import { useProviderStore } from '@/store/provider-store';

import { ModelPickerContent } from '../model-picker-content';

jest.mock('@/providers/create-adapter', () => ({ createProviderAdapter: jest.fn() }));

const provider = (id: string, name: string): ProviderConfig => ({
  id,
  name,
  baseUrl: `https://${id}.example.com/v1`,
  protocol: 'openai-compatible',
  hasApiKey: true,
  createdAt: 0,
  updatedAt: 0,
});

const listModels = jest.fn();

function renderPicker(element: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{element}</QueryClientProvider>);
}

const callbacks = () => ({
  query: '',
  onQueryChange: jest.fn(),
  onSelected: jest.fn(),
  onSetUpProvider: jest.fn(),
});

describe('ModelPickerContent', () => {
  beforeEach(() => {
    useModelStore.setState({ selected: null, favorites: [], manualModels: {} });
    useProviderStore.setState({ providers: [provider('alpha', 'Alpha')] });
    listModels.mockResolvedValue([
      { id: 'alpha-large', providerId: 'alpha', source: 'api' },
      { id: 'alpha-fast', providerId: 'alpha', source: 'api' },
    ]);
    jest.mocked(createProviderAdapter).mockResolvedValue({ listModels, streamChat: jest.fn() });
  });

  it('loads real models and stores the selection', async () => {
    const props = callbacks();
    await renderPicker(<ModelPickerContent {...props} />);

    await fireEvent.press(await screen.findByText('alpha-fast'));

    expect(useModelStore.getState().selected).toEqual({
      providerId: 'alpha',
      modelId: 'alpha-fast',
      label: 'alpha-fast',
    });
    expect(props.onSelected).toHaveBeenCalled();
  });

  it('stars models into the favorites section', async () => {
    await renderPicker(<ModelPickerContent {...callbacks()} />);
    await screen.findByText('alpha-large');

    await fireEvent.press(screen.getAllByRole('button', { name: 'Zu Favoriten hinzufügen' })[0]!);

    expect(useModelStore.getState().favorites).toEqual([
      { providerId: 'alpha', modelId: 'alpha-large' },
    ]);
    expect(screen.getByText('Favoriten')).toBeOnTheScreen();
    expect(screen.getAllByText('alpha-large')).toHaveLength(2);
  });

  it('adds model IDs manually', async () => {
    await renderPicker(<ModelPickerContent {...callbacks()} />);
    await screen.findByText('alpha-large');

    await fireEvent.press(screen.getByRole('button', { name: 'Modell-ID für Alpha hinzufügen' }));
    await fireEvent.changeText(screen.getByLabelText('Modell-ID'), ' alpha-preview ');
    await fireEvent.press(screen.getByRole('button', { name: 'Hinzufügen' }));

    expect(useModelStore.getState().manualModels).toEqual({ alpha: ['alpha-preview'] });
    expect(screen.getByText('alpha-preview')).toBeOnTheScreen();
    expect(screen.getByText('Manuell hinzugefügt')).toBeOnTheScreen();
  });

  it('shows provider errors with a retry button', async () => {
    listModels.mockRejectedValueOnce(new ProviderError('invalidApiKey'));
    await renderPicker(<ModelPickerContent {...callbacks()} />);

    expect(
      await screen.findByText('Der API-Key wurde abgelehnt. Prüfe ihn in den Einstellungen.'),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Erneut versuchen' }));

    expect(await screen.findByText('alpha-large')).toBeOnTheScreen();
    expect(listModels).toHaveBeenCalledTimes(2);
  });

  it('points to the provider settings when nothing is set up', async () => {
    useProviderStore.setState({ providers: [] });
    const props = callbacks();
    await renderPicker(<ModelPickerContent {...props} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Anbieter einrichten' }));

    expect(props.onSetUpProvider).toHaveBeenCalled();
  });
});
