import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import { Composer } from '../composer';

describe('Composer', () => {
  it('disables sending while the input is empty', async () => {
    await render(<Composer isResponding={false} onSend={jest.fn()} onStop={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Senden' })).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Nachricht'), '   ');
    expect(screen.getByRole('button', { name: 'Senden' })).toBeDisabled();
  });

  it('sends the trimmed text, clears the input and gives haptic feedback', async () => {
    const onSend = jest.fn();
    await render(<Composer isResponding={false} onSend={onSend} onStop={jest.fn()} />);

    await fireEvent.changeText(screen.getByLabelText('Nachricht'), '  Hallo  ');
    await fireEvent.press(screen.getByRole('button', { name: 'Senden' }));

    expect(onSend).toHaveBeenCalledWith('Hallo');
    expect(Haptics.impactAsync).toHaveBeenCalled();
    expect(screen.getByLabelText('Nachricht')).toHaveDisplayValue('');
  });

  it('turns into a stop button while a reply is streaming', async () => {
    const onStop = jest.fn();
    await render(<Composer isResponding onSend={jest.fn()} onStop={onStop} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Antwort stoppen' }));

    expect(onStop).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Senden' })).not.toBeOnTheScreen();
  });
});
