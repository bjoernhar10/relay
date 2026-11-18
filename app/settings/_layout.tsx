import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { makeStyles, useTheme } from '@/theme';

export default function SettingsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: colors.textPrimary,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: styles.content,
      }}
    >
      <Stack.Screen name="index" options={{ title: t('settings.title') }} />
      <Stack.Screen name="providers/index" options={{ title: t('providers.title') }} />
      <Stack.Screen name="providers/new" options={{ title: t('providers.chooseTitle') }} />
      <Stack.Screen name="providers/form" />
    </Stack>
  );
}

const useStyles = makeStyles(({ colors, typography }) => ({
  header: {
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  content: {
    backgroundColor: colors.background,
  },
}));
