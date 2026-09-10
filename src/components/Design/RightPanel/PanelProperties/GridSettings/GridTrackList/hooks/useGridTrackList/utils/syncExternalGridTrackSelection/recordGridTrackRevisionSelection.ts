import { RefObject } from 'react';

export const recordGridTrackRevisionSelection = (
  selectionByRevisionRef: RefObject<WeakMap<object, number[]>>,
  revision: unknown,
  selectedIndices: number[],
): void => {
  if (typeof revision === 'object' && revision !== null) {
    selectionByRevisionRef.current.set(revision, selectedIndices);
  }
};
