import { BottomSheetTextInput, BottomSheetView, type BottomSheetModal } from '@gorhom/bottom-sheet';
import { useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/form/button';
import { Sheet } from '@/components/sheet';
import { stopReply } from '@/components/chat/chat-engine';
import { deleteChat, renameChat, setChatArchived, setChatPinned } from '@/db/conversation-commands';
import { layout, makeStyles, useTheme } from '@/theme';

import type { ChatSummary } from './chat-summary';
import { SheetActionRow } from './sheet-action-row';

type ChatActionsSheetProps = {
  ref: RefObject<BottomSheetModal | null>;
  chat: ChatSummary | null;
};

export function ChatActionsSheet({ ref, chat }: ChatActionsSheetProps) {
  return (
    <Sheet ref={ref} snapPoint={layout.sheetSnapPoint} keyboardBehavior="interactive">
      <BottomSheetView>
        {chat ? (
          <ChatActions key={chat.id} chat={chat} close={() => ref.current?.dismiss()} />
        ) : null}
      </BottomSheetView>
    </Sheet>
  );
}

type ChatActionsProps = {
  chat: ChatSummary;
  close: () => void;
};

export function ChatActions({ chat, close }: ChatActionsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(chat.title);

  const act = (action: () => Promise<void>) => {
    close();
    void action();
  };

  const confirmDelete = () =>
    Alert.alert(
      t('chatActions.deleteConfirmTitle'),
      t('chatActions.deleteConfirmMessage', { title: chat.title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('chatActions.delete'),
          style: 'destructive',
          onPress: () =>
            act(async () => {
              stopReply(chat.id);
              await deleteChat(chat.id);
            }),
        },
      ],
    );

  if (isRenaming) {
    const trimmed = title.trim();
    return (
      <View style={styles.container}>
        <BottomSheetTextInput
          autoFocus
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={() => trimmed && act(() => renameChat(chat.id, trimmed))}
          accessibilityLabel={t('chatActions.titleLabel')}
          placeholder={t('chatActions.titleLabel')}
          placeholderTextColor={colors.textTertiary}
          returnKeyType="done"
          style={styles.input}
        />
        <View style={styles.renameActions}>
          <Button variant="plain" label={t('common.cancel')} onPress={() => setIsRenaming(false)} />
          <Button
            label={t('chatActions.save')}
            disabled={!trimmed}
            onPress={() => act(() => renameChat(chat.id, trimmed))}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText variant="bodyStrong" numberOfLines={1} style={styles.title}>
        {chat.title}
      </AppText>
      <SheetActionRow
        icon="rename"
        label={t('chatActions.rename')}
        onPress={() => setIsRenaming(true)}
      />
      <SheetActionRow
        icon={chat.pinned ? 'unpin' : 'pin'}
        label={chat.pinned ? t('chatActions.unpin') : t('chatActions.pin')}
        onPress={() => act(() => setChatPinned(chat.id, !chat.pinned))}
      />
      <SheetActionRow
        icon={chat.archived ? 'unarchive' : 'archive'}
        label={chat.archived ? t('chatActions.unarchive') : t('chatActions.archive')}
        onPress={() => act(() => setChatArchived(chat.id, !chat.archived))}
      />
      <SheetActionRow
        icon="delete"
        label={t('chatActions.delete')}
        onPress={confirmDelete}
        destructive
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, sizes, typography }) => ({
  container: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  renameActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
}));
