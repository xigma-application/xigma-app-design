import { RefObject } from 'react';

export const commitGridTrackSelectionClear = (anchorRef: RefObject<number | null>, setSelection: (indices: number[]) => void): void => {
  anchorRef.current = null;
  setSelection([]);
};
