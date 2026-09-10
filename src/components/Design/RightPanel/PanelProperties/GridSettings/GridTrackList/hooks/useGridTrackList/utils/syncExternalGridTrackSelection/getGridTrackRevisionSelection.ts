import { RefObject } from 'react';

export const getGridTrackRevisionSelection = (
  selectionByRevisionRef: RefObject<WeakMap<object, number[]>>,
  revision: unknown,
): number[] | undefined => (typeof revision === 'object' && revision !== null ? selectionByRevisionRef.current.get(revision) : undefined);
