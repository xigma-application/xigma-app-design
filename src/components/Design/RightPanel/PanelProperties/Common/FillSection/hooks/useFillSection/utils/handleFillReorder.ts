// types
import { TPaint } from 'types/design/paint/types';

// utils
import { commitFillReorder } from './commitFillReorder';

export const handleFillReorder = (
  fills: TPaint[],
  commit: (nextFills: TPaint[]) => void,
  setSelection: (indices: number[]) => void,
  sourceIndices: number[],
  insertionSlot: number,
  grabbedIndex: number,
  hasMoved: boolean,
): void => commitFillReorder(fills, commit, setSelection, sourceIndices, insertionSlot, grabbedIndex, hasMoved);
