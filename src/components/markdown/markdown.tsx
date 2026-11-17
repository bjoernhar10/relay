import { useMemo } from 'react';

import { MarkdownBlocks } from './markdown-blocks';
import { parseMarkdown } from './parse-markdown';

type MarkdownProps = {
  content: string;
};

export function Markdown({ content }: MarkdownProps) {
  const tokens = useMemo(() => parseMarkdown(content), [content]);
  return <MarkdownBlocks tokens={tokens} />;
}
