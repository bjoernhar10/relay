import { View } from 'react-native';

import { Markdown } from '@/components/markdown/markdown';
import { makeStyles } from '@/theme';

import { MessageActions } from './message-actions';
import { StreamingIndicator } from './streaming-indicator';

type AssistantMessageProps = {
  content: string;
  modelLabel: string;
  isStreaming?: boolean;
};

export function AssistantMessage({
  content,
  modelLabel,
  isStreaming = false,
}: AssistantMessageProps) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      {content ? <Markdown content={content} /> : null}
      {isStreaming ? (
        <StreamingIndicator />
      ) : (
        <MessageActions content={content} modelLabel={modelLabel} />
      )}
    </View>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  container: {
    gap: spacing.md,
  },
}));
