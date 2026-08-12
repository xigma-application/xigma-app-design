import i18n, { TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';

// others
import { DEFAULT_LANGUAGE } from './constants';
import { resources } from './resources';

// types
import { TLanguage } from './types';

// utils
import { getInitialLanguage } from './utils/getInitialLanguage';

export const initI18n = (language: TLanguage = getInitialLanguage()): Promise<TFunction> =>
  i18n.use(initReactI18next).init({
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    lng: language,
    resources,
  });
