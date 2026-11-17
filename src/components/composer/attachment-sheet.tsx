import { BottomSheetView, type BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Ref } from 'react';

import { Sheet } from '@/components/sheet';
import { layout } from '@/theme';

type AttachmentSheetProps = {
  ref: Ref<BottomSheetModal>;
};

export function AttachmentSheet({ ref }: AttachmentSheetProps) {
  return (
    <Sheet ref={ref} snapPoint={layout.sheetSnapPoint}>
      <BottomSheetView>{null}</BottomSheetView>
    </Sheet>
  );
}
