import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import uk from './locales/uk.json';
import de from './locales/de.json';
import it from './locales/it.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      uk: { translation: uk },
      de: { translation: de },
      it: { translation: it },
    },
    lng: 'uk',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
