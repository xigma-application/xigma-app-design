import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

// others
import { STORAGE_KEY } from './constants';

// types
import { Theme } from 'types/theme';

export type TUseTheme = {
  setTheme: Dispatch<SetStateAction<Theme>>;
  theme: Theme;
  toggleTheme: () => void;
};

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export const useTheme = (): TUseTheme => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return { setTheme, theme, toggleTheme };
};
