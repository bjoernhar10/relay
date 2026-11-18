import { SectionList } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/app-text';
import { makeStyles } from '@/theme';

import type { ChatSummary } from './chat-summary';
import { DrawerRow } from './drawer-row';
import type { ChatSection } from './group-chats-by-date';

type ChatListProps = {
  sections: ChatSection[];
  activeChatId?: string;
  onSelectChat: (chat: ChatSummary) => void;
  onOpenChatMenu?: (chat: ChatSummary) => void;
  emptyText?: string;
};

export function ChatList({
  sections,
  activeChatId,
  onSelectChat,
  onOpenChatMenu,
  emptyText,
}: ChatListProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <SectionList
      sections={sections}
      keyExtractor={(chat) => chat.id}
      renderSectionHeader={({ section }) => (
        <AppText variant="captionStrong" color="textTertiary" style={styles.sectionHeader}>
          {t(`chatGroups.${section.group}`)}
        </AppText>
      )}
      renderItem={({ item }) => (
        <DrawerRow
          label={item.title}
          active={item.id === activeChatId}
          onPress={() => onSelectChat(item)}
          onLongPress={onOpenChatMenu ? () => onOpenChatMenu(item) : undefined}
        />
      )}
      ListEmptyComponent={
        emptyText ? (
          <AppText color="textTertiary" style={styles.empty}>
            {emptyText}
          </AppText>
        ) : undefined
      }
      stickySectionHeadersEnabled={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    />
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  content: {
    paddingBottom: spacing.lg,
  },
  empty: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
}));
