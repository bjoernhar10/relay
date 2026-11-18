import { cleanTitle, provisionalTitle, titleRequest } from '../generate-title';

describe('provisionalTitle', () => {
  it('uses the first message on one line and shortens long ones', () => {
    expect(provisionalTitle('  Wie backe\nich Brot?  ')).toBe('Wie backe ich Brot?');
    const long = provisionalTitle('a'.repeat(100));
    expect(long).toHaveLength(60);
    expect(long.endsWith('…')).toBe(true);
  });
});

describe('cleanTitle', () => {
  it.each([
    ['"Sauerteigbrot backen."', 'Sauerteigbrot backen'],
    ['Titel: Reise nach Lissabon', 'Reise nach Lissabon'],
    ['**Debounce in TypeScript**', 'Debounce in TypeScript'],
    ['„Umzug planen“\nWeil der Nutzer…', 'Umzug planen'],
    ['   ', ''],
  ])('turns %j into %j', (raw, expected) => {
    expect(cleanTitle(raw)).toBe(expected);
  });
});

describe('titleRequest', () => {
  it('asks for a title with a system instruction and an excerpt of the exchange', () => {
    const [system, user] = titleRequest('Frage', 'x'.repeat(5000));
    expect(system?.role).toBe('system');
    expect(user?.content.startsWith('User: Frage\n\nAssistant: ')).toBe(true);
    expect(user?.content.length).toBeLessThan(1600);
  });
});
