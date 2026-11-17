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
import { useChatSession } from './use-chat-session';

type ChatViewProps = {
  initialMessages: ChatMessage[];
};

export function ChatView({ initialMessages }: ChatViewProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { messages, isResponding, send, stop, isSentInSession } = useChatSession(initialMessages);
  const listRef = useRef<FlashListRef<ChatMessage>>(null);
  const composerHeight = useSharedValue(0);
  const [isEndVisible, setIsEndVisible] = useState(true);
  const keyboard = useReanimatedKeyboardAnimation();

  // The empty state is not scrollable, so it makes room for the composer and keyboard itself.
  const emptyStateStyle = useAnimatedStyle(() => ({
    paddingBottom: composerHeight.value + Math.max(0, -keyboard.height.value - insets.bottom),
  }));

  const scrollToBottom = () => listRef.current?.scrollToEnd({ animated: true });

  const handleSend = (text: string) => {
    send(text);
    requestAnimationFrame(scrollToBottom);
  };

  const handleComposerLayout = (event: LayoutChangeEvent) => {
    composerHeight.value = event.nativeEvent.layout.height;
  };

  return (
    <View style={styles.container}>
      {messages.length === 0 ? (
        <Animated.View style={[styles.container, emptyStateStyle]}>
          <EmptyChat />
        </Animated.View>
      ) : (
        <MessageList
          ref={listRef}
          messages={messages}
          composerHeight={composerHeight}
          onEndVisibleChange={setIsEndVisible}
          isSentInSession={isSentInSession}
        />
      )}
      <KeyboardStickyView offset={{ opened: insets.bottom }} style={styles.composer}>
        {messages.length > 0 && !isEndVisible ? (
          <ScrollToBottomButton onPress={scrollToBottom} />
        ) : null}
        <Composer
          isResponding={isResponding}
          onSend={handleSend}
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
