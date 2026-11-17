import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useMemo, type Ref } from 'react';
import type { ScrollViewProps } from 'react-native';
import {
  KeyboardChatScrollView,
  type KeyboardChatScrollViewRef,
} from 'react-native-keyboard-controller';
import Animated, { FadeInDown, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, useTheme } from '@/theme';

import { AssistantMessage } from './assistant-message';
import type { ChatMessage } from './chat-message';
import { UserMessage } from './user-message';

// Fraction of the visible height: while the user is this close to the end,
// new and growing messages keep the list scrolled to the bottom.
const autoscrollToBottomThreshold = 0.15;

type MessageListProps = {
  ref: Ref<FlashListRef<ChatMessage>>;
  messages: ChatMessage[];
  composerHeight: SharedValue<number>;
  onEndVisibleChange: (visible: boolean) => void;
  isSentInSession: (messageId: string) => boolean;
};

export function MessageList({
  ref,
  messages,
  composerHeight,
  onEndVisibleChange,
  isSentInSession,
}: MessageListProps) {
  const { motion } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  // The scroll component must keep its identity across renders, otherwise FlashList remounts it.
  const ScrollComponent = useMemo(
    () =>
      function ChatScrollView({
        ref: scrollRef,
        ...props
      }: ScrollViewProps & { ref?: Ref<KeyboardChatScrollViewRef> }) {
        return (
          <KeyboardChatScrollView
            {...props}
            ref={scrollRef}
            offset={insets.bottom}
            extraContentPadding={composerHeight}
            keyboardLiftBehavior="whenAtEnd"
            onEndVisible={onEndVisibleChange}
          />
        );
      },
    [insets.bottom, composerHeight, onEndVisibleChange],
  );

  return (
    <FlashList
      ref={ref}
      data={messages}
      keyExtractor={(message) => message.id}
      getItemType={(message) => message.role}
      renderScrollComponent={ScrollComponent}
      renderItem={({ item }) => (
        <Animated.View
          entering={isSentInSession(item.id) ? FadeInDown.duration(motion.normal) : undefined}
          style={styles.item}
        >
          {item.role === 'user' ? (
            <UserMessage content={item.content} />
          ) : (
            <AssistantMessage
              content={item.content}
              modelLabel={item.modelLabel}
              isStreaming={item.status === 'streaming'}
            />
          )}
        </Animated.View>
      )}
      maintainVisibleContentPosition={{
        startRenderingFromBottom: true,
        autoscrollToBottomThreshold,
        animateAutoScrollToBottom: false,
      }}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    />
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  item: {
    paddingBottom: spacing.xl,
  },
}));
