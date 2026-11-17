import {
  BottomSheetBackdrop,
  BottomSheetModal,
  type BottomSheetBackdropProps,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import type { Ref } from 'react';

import { makeStyles } from '@/theme';

type SheetProps = Pick<
  BottomSheetModalProps,
  'children' | 'onDismiss' | 'keyboardBehavior' | 'keyboardBlurBehavior'
> & {
  ref: Ref<BottomSheetModal>;
  snapPoint: string;
};

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
}

export function Sheet({ ref, snapPoint, children, ...props }: SheetProps) {
  const styles = useStyles();
  return (
    <BottomSheetModal
      {...props}
      ref={ref}
      snapPoints={[snapPoint]}
      enableDynamicSizing={false}
      backdropComponent={Backdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      {children}
    </BottomSheetModal>
  );
}

const useStyles = makeStyles(({ colors, radii }) => ({
  background: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
  },
  handle: {
    backgroundColor: colors.border,
  },
}));
