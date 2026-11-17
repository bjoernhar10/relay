import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';

const copiedFeedbackDurationMs = 1500;

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), copiedFeedbackDurationMs);
  };

  return { copied, copy };
}
