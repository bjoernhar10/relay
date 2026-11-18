import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import type { ChatSummary } from './chat-summary';

export function useChatMenu() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [menuChat, setMenuChat] = useState<ChatSummary | null>(null);

  const openChatMenu = (chat: ChatSummary) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    setMenuChat(chat);
    sheetRef.current?.present();
  };

  return { sheetRef, menuChat, openChatMenu };
}
