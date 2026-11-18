import { useNavigation } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/icon-button';

// Screens inside a nested stack reach the drawer through their parent navigator.
export function DrawerMenuButton() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const openDrawer = () =>
    navigation.getParent<DrawerNavigationProp<Record<string, object | undefined>>>()?.openDrawer();
  return (
    <IconButton icon="menu" accessibilityLabel={t('navigation.openMenu')} onPress={openDrawer} />
  );
}
