import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { de } from './locales/de';
import { en, type TranslationResources } from './locales/en';

export const supportedLanguages = ['de', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const fallbackLanguage: SupportedLanguage = 'en';

function isSupportedLanguage(code: string | null): code is SupportedLanguage {
  return supportedLanguages.some((language) => language === code);
}

export function resolveDeviceLanguage(): SupportedLanguage {
  const deviceLanguage = getLocales()
    .map((locale) => locale.languageCode)
    .find(isSupportedLanguage);
  return deviceLanguage ?? fallbackLanguage;
}

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
  lng: resolveDeviceLanguage(),
  fallbackLng: fallbackLanguage,
  interpolation: { escapeValue: false },
  initAsync: false,
});

export default i18n;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: TranslationResources };
  }
}
