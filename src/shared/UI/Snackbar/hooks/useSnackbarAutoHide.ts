import { useEffect } from 'react';

export const useSnackbarAutoHide = (durationMs: number | undefined, onHide: (() => void) | undefined): void => {
  useEffect(() => {
    if (durationMs !== undefined && onHide) {
      const timeoutId = window.setTimeout(onHide, durationMs);
      return (): void => window.clearTimeout(timeoutId);
    }
  }, [durationMs, onHide]);
};
