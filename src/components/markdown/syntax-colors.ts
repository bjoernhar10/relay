import type { SyntaxColors } from '@/theme';

const tokenTypeToSyntaxColor: Record<string, keyof SyntaxColors> = {
  comment: 'comment',
  prolog: 'comment',
  doctype: 'comment',
  keyword: 'keyword',
  boolean: 'keyword',
  builtin: 'keyword',
  important: 'keyword',
  'attr-name': 'keyword',
  string: 'string',
  char: 'string',
  'template-string': 'string',
  'attr-value': 'string',
  regex: 'string',
  number: 'number',
  constant: 'number',
  function: 'function',
  'class-name': 'function',
  tag: 'function',
};

export function syntaxColorFor(tokenTypes: string[], colors: SyntaxColors): string | undefined {
  for (const type of [...tokenTypes].reverse()) {
    const colorKey = tokenTypeToSyntaxColor[type];
    if (colorKey) return colors[colorKey];
  }
  return undefined;
}
