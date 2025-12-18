import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import uk from './locales/uk.json';

// Supported languages
export const SUPPORTED_LANGUAGES = ['uk', 'en', 'de', 'it'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Language display names
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  uk: 'Українська',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano'
};

// Cache for loaded languages
const loadedLanguages = new Set<string>(['uk']);

// Lazy load language
export const loadLanguage = async (lang: SupportedLanguage): Promise<void> => {
  if (loadedLanguages.has(lang)) {
    await i18n.changeLanguage(lang);
    return;
  }

  try {
    let translations;
    switch (lang) {
      case 'en':
        translations = (await import('./locales/en.json')).default;
        break;
      case 'de':
        translations = (await import('./locales/de.json')).default;
        break;
      case 'it':
        translations = (await import('./locales/it.json')).default;
        break;
      default:
        return;
    }

    i18n.addResourceBundle(lang, 'translation', translations);
    loadedLanguages.add(lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error(`Failed to load language: ${lang}`, error);
  }
};

// Check if language is loaded
export const isLanguageLoaded = (lang: SupportedLanguage): boolean => {
  return loadedLanguages.has(lang);
};

i18n.use(initReactI18next).init({
  resources: {
    uk: { translation: uk }
  },
  lng: 'uk',
  fallbackLng: 'uk',
  interpolation: { escapeValue: false }
});

export default i18n;
