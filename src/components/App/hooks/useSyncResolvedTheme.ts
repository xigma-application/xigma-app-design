import { useCallback, useEffect } from 'react';

// store
import { setResolvedTheme } from 'store/design/slice';
import { useAppDispatch } from 'store';

// utils
import { getResolvedTheme } from 'store/design/utils/getResolvedTheme';

export const useSyncResolvedTheme = (): void => {
  const dispatch = useAppDispatch();

  const syncResolvedTheme = useCallback((): void => {
    dispatch(setResolvedTheme(getResolvedTheme()));
  }, [dispatch]);

  useEffect(() => {
    const observer = new MutationObserver(syncResolvedTheme);
    const colorSchemeQuery = window.matchMedia?.('(prefers-color-scheme: light)');

    syncResolvedTheme();
    observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
    colorSchemeQuery?.addEventListener('change', syncResolvedTheme);

    return (): void => {
      observer.disconnect();
      colorSchemeQuery?.removeEventListener('change', syncResolvedTheme);
    };
  }, [syncResolvedTheme]);
};
