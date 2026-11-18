import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useState, type RefObject } from 'react';

import { Sheet } from '@/components/sheet';
import { layout } from '@/theme';

import { ModelPickerContent } from './model-picker-content';

type ModelPickerSheetProps = {
  ref: RefObject<BottomSheetModal | null>;
};

export function ModelPickerSheet({ ref }: ModelPickerSheetProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const close = () => ref.current?.dismiss();

  return (
    <Sheet
      ref={ref}
      snapPoint={layout.tallSheetSnapPoint}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      onDismiss={() => setQuery('')}
    >
      <ModelPickerContent
        query={query}
        onQueryChange={setQuery}
        onSelected={close}
        onSetUpProvider={() => {
          close();
          router.push('/settings/providers');
        }}
      />
    </Sheet>
  );
}
