// types
import { TResolvedTheme } from '../types';

export const getResolvedTheme = (): TResolvedTheme => {
  const theme = document.documentElement.dataset.theme ?? localStorage.getItem('theme');

  if (theme === 'dark' || theme === 'light') {
    return theme;
  }

  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};
