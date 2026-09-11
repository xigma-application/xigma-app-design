import { RefObject } from 'react';

export const syncSuppressedGridTrackSelection = (
  isSuppressed: boolean,
  clearSelection: () => void,
  lastIsSuppressedRef: RefObject<boolean>,
): void => {
  if (isSuppressed && !lastIsSuppressedRef.current) {
    clearSelection();
  }

  lastIsSuppressedRef.current = isSuppressed;
};
