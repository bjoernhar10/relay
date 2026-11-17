import { Lexer, type MarkedToken, type Token } from 'marked';

// Without extensions the lexer only emits built-in tokens. Narrowing to MarkedToken
// lets the renderers switch exhaustively instead of handling the untyped Generic token.
export function asMarkedTokens(tokens: Token[] | undefined): MarkedToken[] {
  return (tokens ?? []) as MarkedToken[];
}

export function parseMarkdown(content: string): MarkedToken[] {
  return asMarkedTokens(Lexer.lex(content));
}
