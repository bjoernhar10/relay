import { Redirect, useLocalSearchParams } from 'expo-router';

import { ChatView } from '@/components/chat/chat-view';
import { Screen } from '@/components/screen';
import { useConversation } from '@/db/queries';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: conversation, isPending } = useConversation(id);

  // Deleted while open (or an outdated link): fall back to a new chat.
  if (!isPending && !conversation) return <Redirect href="/" />;

  return (
    <Screen testID="chat-screen">
      <ChatView key={id} conversationId={id} />
    </Screen>
  );
}
