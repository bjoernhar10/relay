import { useLocalSearchParams } from 'expo-router';

import { ChatView } from '@/components/chat/chat-view';
import { Screen } from '@/components/screen';

export default function NewChatScreen() {
  // Each "new chat" navigation passes a fresh session param, so the screen starts empty again.
  const { session } = useLocalSearchParams<{ session?: string }>();
  return (
    <Screen testID="new-chat-screen">
      <ChatView key={session} initialMessages={[]} />
    </Screen>
  );
}
