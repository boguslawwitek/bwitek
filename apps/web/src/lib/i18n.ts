import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '../locales/en/common.json';
import plCommon from '../locales/pl/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  pl: {
    common: plCommon,
  },
};

// Custom language detector that prioritizes localStorage
const localStorageLangDetector = {
  name: 'localStorage',
  lookup: () => {
    return localStorage.getItem('i18nextLng') || navigator.language;
  },
  cacheUserLanguage: (lng: string) => {
    localStorage.setItem('i18nextLng', lng);
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    },
  });

export default i18n;
