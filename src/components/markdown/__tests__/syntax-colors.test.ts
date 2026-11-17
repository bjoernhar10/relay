import { colors } from '@/theme';

import { syntaxColorFor } from '../syntax-colors';

const syntax = colors.light.syntax;

describe('syntaxColorFor', () => {
  it('maps Prism token types to theme syntax colors', () => {
    expect(syntaxColorFor(['keyword'], syntax)).toBe(syntax.keyword);
    expect(syntaxColorFor(['template-string'], syntax)).toBe(syntax.string);
  });

  it('prefers the most specific token type', () => {
    expect(syntaxColorFor(['string', 'function'], syntax)).toBe(syntax.function);
  });

  it('leaves plain tokens in the default text color', () => {
    expect(syntaxColorFor(['plain'], syntax)).toBeUndefined();
  });
});
