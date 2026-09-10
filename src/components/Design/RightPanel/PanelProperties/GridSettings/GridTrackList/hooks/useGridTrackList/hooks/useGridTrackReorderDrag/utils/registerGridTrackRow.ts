import { RefObject } from 'react';

export const registerGridTrackRow =
  (rowsRef: RefObject<Map<number, HTMLElement>>, index: number) =>
  (element: HTMLElement | null): void => {
    if (element) {
      rowsRef.current.set(index, element);
      return;
    }

    rowsRef.current.delete(index);
  };
