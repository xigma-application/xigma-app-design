import { RefObject, useCallback, useEffect } from 'react';

export const useClearFillSelectionOnOutsideClick = (
  containerRef: RefObject<HTMLElement | null>,
  hasSelection: boolean,
  clearSelection: TFunc,
): void => {
  const handleOutsideClick = useCallback(
    (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        clearSelection();
      }
    },
    [clearSelection, containerRef],
  );

  useEffect(() => {
    if (hasSelection) {
      window.addEventListener('mousedown', handleOutsideClick);

      return (): void => window.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [handleOutsideClick, hasSelection]);
};
