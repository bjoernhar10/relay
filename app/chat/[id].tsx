import { useLocalSearchParams } from 'expo-router';

import { ChatView } from '@/components/chat/chat-view';
import { dummyConversation } from '@/components/chat/dummy-conversation';
import { Screen } from '@/components/screen';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen testID="chat-screen">
      <ChatView key={id} initialMessages={dummyConversation} />
    </Screen>
  );
}
