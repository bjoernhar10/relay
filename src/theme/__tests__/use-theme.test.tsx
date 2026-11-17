import { act, renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { useThemeStore } from '@/store/theme-store';

import { colors } from '../colors';
import { resolveColorScheme, useTheme } from '../use-theme';

describe('resolveColorScheme', () => {
  it('follows the system when the preference is system', () => {
    expect(resolveColorScheme('system', 'dark')).toBe('dark');
    expect(resolveColorScheme('system', 'light')).toBe('light');
    expect(resolveColorScheme('system', null)).toBe('light');
  });

  it('lets an explicit preference override the system', () => {
    expect(resolveColorScheme('light', 'dark')).toBe('light');
    expect(resolveColorScheme('dark', 'light')).toBe('dark');
  });
});

describe('useTheme', () => {
  beforeEach(() => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');
    useThemeStore.setState({ preference: 'system' });
  });

  it('defaults to the system scheme', async () => {
    const { result } = await renderHook(() => useTheme());

    expect(useThemeStore.getState().preference).toBe('system');
    expect(result.current.colors).toBe(colors.light);
  });

  it('switches when the preference changes in the store', async () => {
    const { result } = await renderHook(() => useTheme());

    await act(() => useThemeStore.getState().setPreference('dark'));

    expect(result.current.scheme).toBe('dark');
    expect(result.current.colors).toBe(colors.dark);
  });
});
