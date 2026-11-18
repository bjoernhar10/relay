import '@/i18n';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { ModelButton } from '@/components/model-picker/model-button';
import { NewChatButton } from '@/components/chat/new-chat-button';
import { DrawerContent } from '@/components/drawer/drawer-content';
import { IconButton } from '@/components/icon-button';
import { makeStyles, toNavigationTheme, useTheme } from '@/theme';

const chatScreenOptions = {
  headerTitle: () => <ModelButton />,
  headerRight: () => <NewChatButton />,
};

export default function RootLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <BottomSheetModalProvider>
          <ThemeProvider value={toNavigationTheme(theme)}>
            <Drawer
              drawerContent={(props) => <DrawerContent {...props} />}
              screenOptions={({ navigation }) => ({
                drawerType: 'slide',
                swipeEnabled: true,
                drawerStyle: styles.drawer,
                overlayColor: 'transparent',
                headerShadowVisible: false,
                headerTitleAlign: 'center',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitle,
                headerLeftContainerStyle: styles.headerSide,
                headerRightContainerStyle: styles.headerSide,
                headerLeft: () => (
                  <IconButton
                    icon="menu"
                    accessibilityLabel={t('navigation.openMenu')}
                    onPress={navigation.openDrawer}
                  />
                ),
              })}
            >
              <Drawer.Screen name="index" options={chatScreenOptions} />
              <Drawer.Screen name="chat/[id]" options={chatScreenOptions} />
              <Drawer.Screen
                name="settings"
                options={{ headerShown: false, swipeEnabled: false }}
              />
            </Drawer>
            <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const useStyles = makeStyles(({ colors, spacing, typography }) => ({
  root: {
    flex: 1,
  },
  drawer: {
    backgroundColor: colors.sidebar,
  },
  header: {
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  headerSide: {
    paddingHorizontal: spacing.sm,
  },
}));
