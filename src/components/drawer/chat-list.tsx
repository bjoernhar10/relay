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
};

export function ChatList({ sections, activeChatId, onSelectChat }: ChatListProps) {
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
        />
      )}
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
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
}));
