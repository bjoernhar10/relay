import type { DrawerContentComponentProps } from 'expo-router/drawer';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { newChatParams } from '@/components/chat/new-chat-params';
import { SearchField } from '@/components/search-field';
import { makeStyles } from '@/theme';

import { ChatList } from './chat-list';
import { DrawerRow } from './drawer-row';
import { createDummyChats } from './dummy-chats';
import { groupChatsByDate } from './group-chats-by-date';

function activeChatIdFrom(state: DrawerContentComponentProps['state']): string | undefined {
  const route = state.routes[state.index];
  const params = route?.params;
  return route?.name === 'chat/[id]' && params && 'id' in params && typeof params.id === 'string'
    ? params.id
    : undefined;
}

export function DrawerContent({ navigation, state }: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const sections = useMemo(() => {
    const now = new Date();
    return groupChatsByDate(createDummyChats(now), now);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <SearchField placeholder={t('drawer.search')} />
        <DrawerRow
          icon="newChat"
          label={t('drawer.newChat')}
          onPress={() => navigation.navigate('index', newChatParams())}
          emphasized
        />
      </View>
      <ChatList
        sections={sections}
        activeChatId={activeChatIdFrom(state)}
        onSelectChat={(chat) => navigation.navigate('chat/[id]', { id: chat.id })}
      />
      <View style={styles.footer}>
        <DrawerRow
          icon="settings"
          label={t('drawer.settings')}
          onPress={() => navigation.navigate('settings')}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing }) => ({
  container: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.sidebar,
  },
  header: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  footer: {
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
}));
