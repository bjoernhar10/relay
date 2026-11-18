import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChatActionsSheet } from '@/components/drawer/chat-actions-sheet';
import { ChatList } from '@/components/drawer/chat-list';
import { groupChatsByDate } from '@/components/drawer/group-chats-by-date';
import { useChatMenu } from '@/components/drawer/use-chat-menu';
import { useConversations } from '@/db/queries';
import { makeStyles } from '@/theme';

export default function ArchiveScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();
  const { data: conversations = [], isPending } = useConversations({ archived: true, search: '' });
  const { sheetRef, menuChat, openChatMenu } = useChatMenu();

  return (
    <View style={styles.container}>
      <ChatList
        sections={groupChatsByDate(conversations, new Date())}
        onSelectChat={(chat) =>
          router.navigate({ pathname: '/chat/[id]', params: { id: chat.id } })
        }
        onOpenChatMenu={openChatMenu}
        emptyText={isPending ? undefined : t('archive.empty')}
      />
      <ChatActionsSheet ref={sheetRef} chat={menuChat} />
    </View>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  container: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
}));
