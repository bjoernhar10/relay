import { getLocales } from 'expo-localization';

import i18n, { resolveDeviceLanguage } from '@/i18n';

const mockedGetLocales = jest.mocked(getLocales);

function mockDeviceLanguages(...codes: (string | null)[]) {
  const locales = codes.map((languageCode) => ({ languageCode }));
  mockedGetLocales.mockReturnValue(locales as unknown as ReturnType<typeof getLocales>);
}

describe('resolveDeviceLanguage', () => {
  it('uses the first supported device language', () => {
    mockDeviceLanguages('fr', 'de', 'en');
    expect(resolveDeviceLanguage()).toBe('de');
  });

  it('falls back to English when no device language is supported', () => {
    mockDeviceLanguages('fr', null);
    expect(resolveDeviceLanguage()).toBe('en');
  });
});

describe('i18n', () => {
  it('is initialised with the device language', () => {
    expect(i18n.language).toBe('de');
    expect(i18n.t('common.appName')).toBe('Relay');
  });
});
