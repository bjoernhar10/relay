import type { FlashListRef } from '@shopify/flash-list';
import { useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import {
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Composer } from '@/components/composer/composer';
import { makeStyles } from '@/theme';

import type { ChatMessage } from './chat-message';
import { EmptyChat } from './empty-chat';
import { MessageList } from './message-list';
import { ScrollToBottomButton } from './scroll-to-bottom-button';
import { regenerateReply, sendMessage, stopReply, wasSentInSession } from './chat-engine';
import { useConversationMessages } from './use-conversation-messages';

type ChatViewProps = {
  conversationId: string | null;
  // Called after the first message of a new chat has created its conversation.
  onConversationCreated?: (conversationId: string) => void;
};

export function ChatView({ conversationId, onConversationCreated }: ChatViewProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { messages, isLoading, isResponding } = useConversationMessages(conversationId);
  const listRef = useRef<FlashListRef<ChatMessage>>(null);
  const composerHeight = useSharedValue(0);
  const [isEndVisible, setIsEndVisible] = useState(true);
  const keyboard = useReanimatedKeyboardAnimation();

  // The empty state is not scrollable, so it makes room for the composer and keyboard itself.
  const emptyStateStyle = useAnimatedStyle(() => ({
    paddingBottom: composerHeight.value + Math.max(0, -keyboard.height.value - insets.bottom),
  }));

  const scrollToBottom = () => listRef.current?.scrollToEnd({ animated: true });

  const handleSend = async (text: string) => {
    const { conversationId: savedId } = await sendMessage(conversationId, text);
    if (!conversationId) onConversationCreated?.(savedId);
    requestAnimationFrame(scrollToBottom);
  };

  const stop = () => {
    if (conversationId) stopReply(conversationId);
  };

  const regenerate = (messageId: string) => {
    if (conversationId) void regenerateReply(conversationId, messageId);
  };

  const handleComposerLayout = (event: LayoutChangeEvent) => {
    composerHeight.value = event.nativeEvent.layout.height;
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.container} />
      ) : messages.length === 0 ? (
        <Animated.View style={[styles.container, emptyStateStyle]}>
          <EmptyChat />
        </Animated.View>
      ) : (
        <MessageList
          ref={listRef}
          messages={messages}
          composerHeight={composerHeight}
          onEndVisibleChange={setIsEndVisible}
          isSentInSession={wasSentInSession}
          isResponding={isResponding}
          onRegenerate={regenerate}
        />
      )}
      <KeyboardStickyView offset={{ opened: insets.bottom }} style={styles.composer}>
        {messages.length > 0 && !isEndVisible ? (
          <ScrollToBottomButton onPress={scrollToBottom} />
        ) : null}
        <Composer
          isResponding={isResponding}
          onSend={(text) => void handleSend(text)}
          onStop={stop}
          onLayout={handleComposerLayout}
        />
      </KeyboardStickyView>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  container: {
    flex: 1,
  },
  composer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
}));
