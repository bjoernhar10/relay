import { render, screen } from '@testing-library/react-native';

import { EmptyChat } from '../empty-chat';

describe('EmptyChat', () => {
  it('shows a greeting and four suggestions', async () => {
    await render(<EmptyChat />);

    expect(screen.getByRole('header', { name: 'Wie kann ich helfen?' })).toBeOnTheScreen();
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByText('E-Mail formulieren')).toBeOnTheScreen();
    expect(screen.getByText('an den Vermieter wegen der Heizung')).toBeOnTheScreen();
  });
});
