import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { createRef } from 'react';

import { useModelStore } from '@/store/model-store';

import { ModelPickerSheet } from '../model-picker-sheet';

describe('ModelPickerSheet', () => {
  beforeEach(() => useModelStore.setState({ selectedModelId: 'deepseek/deepseek-chat' }));

  it('shows the favorites and marks the selected model', async () => {
    await render(<ModelPickerSheet ref={createRef<BottomSheetModal>()} />);

    expect(screen.getByText('Favoriten')).toBeOnTheScreen();

    const [selectedRow] = screen.getAllByRole('button', { selected: true });
    expect(within(selectedRow!).getByText('deepseek-chat')).toBeOnTheScreen();
  });

  it('filters by search and stores the chosen model', async () => {
    await render(<ModelPickerSheet ref={createRef<BottomSheetModal>()} />);

    await fireEvent.changeText(screen.getByLabelText('Modell suchen'), 'kimi');
    expect(screen.queryByText('Favoriten')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByText('kimi-k2'));

    expect(useModelStore.getState().selectedModelId).toBe('moonshot/kimi-k2');
  });

  it('shows an empty state when no model matches', async () => {
    await render(<ModelPickerSheet ref={createRef<BottomSheetModal>()} />);

    await fireEvent.changeText(screen.getByLabelText('Modell suchen'), 'xyz');

    expect(screen.getByText('Keine Modelle gefunden')).toBeOnTheScreen();
  });
});
