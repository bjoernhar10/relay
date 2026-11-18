import { View } from 'react-native';

import { Markdown } from '@/components/markdown/markdown';
import { makeStyles } from '@/theme';

import type { AssistantChatMessage } from './chat-message';
import { ErrorNotice } from './error-notice';
import { MessageActions } from './message-actions';
import { ReasoningBlock } from './reasoning-block';
import { StreamingIndicator } from './streaming-indicator';

type AssistantMessageProps = {
  message: Pick<AssistantChatMessage, 'content' | 'reasoning' | 'modelLabel' | 'status' | 'error'>;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
};

export function AssistantMessage({
  message,
  canRegenerate = true,
  onRegenerate,
}: AssistantMessageProps) {
  const styles = useStyles();
  const { content, reasoning, modelLabel, status, error } = message;
  const isStreaming = status === 'streaming';

  return (
    <View style={styles.container}>
      {reasoning ? (
        <ReasoningBlock reasoning={reasoning} isThinking={isStreaming && !content} />
      ) : null}
      {content ? <Markdown content={content} /> : null}
      {isStreaming && !content && !reasoning ? <StreamingIndicator /> : null}
      {status === 'error' ? <ErrorNotice error={error} onRetry={onRegenerate} /> : null}
      {status === 'complete' || status === 'stopped' ? (
        <MessageActions
          content={content}
          modelLabel={modelLabel}
          canRegenerate={canRegenerate}
          onRegenerate={onRegenerate}
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  container: {
    gap: spacing.md,
  },
}));
