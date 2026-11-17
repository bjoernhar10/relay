import type { ReactNode } from 'react';
import { View } from 'react-native';

import { makeStyles } from '@/theme';

type ScreenProps = {
  children?: ReactNode;
  testID?: string;
};

export function Screen({ children, testID }: ScreenProps) {
  const styles = useStyles();
  return (
    <View style={styles.container} testID={testID}>
      {children}
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
}));
