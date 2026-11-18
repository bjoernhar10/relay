import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import '@/i18n';

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'de' }]),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));

jest.mock('expo-secure-store', () => {
  const values = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (key: string, value: string) => void values.set(key, value)),
    getItemAsync: jest.fn(async (key: string) => values.get(key) ?? null),
    deleteItemAsync: jest.fn(async (key: string) => void values.delete(key)),
  };
});

jest.mock('expo-sqlite/kv-store', () => {
  const values = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: async (key: string) => values.get(key) ?? null,
      setItem: async (key: string, value: string) => void values.set(key, value),
      removeItem: async (key: string) => void values.delete(key),
    },
  };
});

jest.mock('expo-crypto', () => ({
  getRandomValues: (array: Uint8Array<ArrayBuffer>) => globalThis.crypto.getRandomValues(array),
}));

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('react-native-keyboard-controller', () =>
  jest.requireActual('react-native-keyboard-controller/jest'),
);
jest.mock('@gorhom/bottom-sheet', () => jest.requireActual('@gorhom/bottom-sheet/mock'));
