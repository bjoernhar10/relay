import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/icon-button';

import { newChatParams } from './new-chat-params';

export function NewChatButton() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <IconButton
      icon="newChat"
      accessibilityLabel={t('chat.newChat')}
      onPress={() => router.navigate({ pathname: '/', params: newChatParams() })}
    />
  );
}
