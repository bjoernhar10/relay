import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { Markdown } from '../markdown';

const content = `## Überschrift

Text mit \`inline code\` und **fett**.

\`\`\`ts
const answer = 42;
\`\`\`

3. drei
4. vier

- [x] erledigt

| Name | Wert |
| --- | --- |
| a | 1 |`;

describe('Markdown', () => {
  beforeEach(async () => {
    await render(<Markdown content={content} />);
  });

  it('renders headings, inline formatting and lists', () => {
    expect(screen.getByRole('header', { name: 'Überschrift' })).toBeOnTheScreen();
    expect(screen.getByText('inline code')).toBeOnTheScreen();
    expect(screen.getByText('fett')).toBeOnTheScreen();
    expect(screen.getByText('3.')).toBeOnTheScreen();
    expect(screen.getByText('4.')).toBeOnTheScreen();
    expect(screen.getByText('erledigt')).toBeOnTheScreen();
  });

  it('renders tables with header and body cells', () => {
    for (const cell of ['Name', 'Wert', 'a', '1']) {
      expect(screen.getByText(cell)).toBeOnTheScreen();
    }
  });

  it('highlights code blocks and copies their content', async () => {
    expect(screen.getByText('ts')).toBeOnTheScreen();
    expect(screen.getByText('const')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Code kopieren' }));

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('const answer = 42;');
    expect(screen.getByText('Kopiert')).toBeOnTheScreen();
  });
});
