// others
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from '../constants';

// types
import { TLanguage } from '../types';

const isAvailableLanguage = (value: string | null): value is TLanguage =>
  (AVAILABLE_LANGUAGES as ReadonlyArray<string | null>).includes(value);

export const getInitialLanguage = (): TLanguage => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  const systemLanguage = navigator.language.slice(0, 2);

  if (isAvailableLanguage(stored)) {
    return stored;
  }

  return isAvailableLanguage(systemLanguage) ? systemLanguage : DEFAULT_LANGUAGE;
};
