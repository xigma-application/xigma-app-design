// types
import { TPaint } from 'types/design/paint/types';

// utils
import { getFillReorderResult } from './getFillReorderResult';

export const commitFillReorder = (
  fills: TPaint[],
  commit: (nextFills: TPaint[]) => void,
  setSelection: (indices: number[]) => void,
  sourceIndices: number[],
  insertionSlot: number,
  grabbedIndex: number,
  hasMoved: boolean,
): void => {
  if (!hasMoved) {
    setSelection([grabbedIndex]);
    return;
  }

  const result = getFillReorderResult(fills, sourceIndices, insertionSlot);

  commit(result.fills);
  setSelection(result.selectedIndices);
};
