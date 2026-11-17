// Splits before every word so that joining the chunks restores the text exactly,
// including line breaks and indentation inside code blocks.
export function splitIntoStreamChunks(text: string): string[] {
  return text.split(/(?<=\s)(?=\S)/);
}
