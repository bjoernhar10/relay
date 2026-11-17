import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { makeStyles } from '@/theme';

type UserMessageProps = {
  content: string;
};

export function UserMessage({ content }: UserMessageProps) {
  const styles = useStyles();
  return (
    <View style={styles.bubble}>
      <AppText selectable>{content}</AppText>
    </View>
  );
}

const useStyles = makeStyles(({ colors, spacing, radii, layout }) => ({
  bubble: {
    alignSelf: 'flex-end',
    maxWidth: layout.userBubbleMaxWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceStrong,
  },
}));
