import { useLocalSearchParams, useRouter } from 'expo-router';

import { ChatView } from '@/components/chat/chat-view';
import { Screen } from '@/components/screen';

export default function NewChatScreen() {
  const router = useRouter();
  // Each "new chat" navigation passes a fresh session param, so the screen starts empty again.
  const { session } = useLocalSearchParams<{ session?: string }>();
  return (
    <Screen testID="new-chat-screen">
      <ChatView
        key={session}
        conversationId={null}
        onConversationCreated={(id) => router.navigate({ pathname: '/chat/[id]', params: { id } })}
      />
    </Screen>
  );
}
