// utils
import { commitFillReorder } from './commitFillReorder';

export const handleFillReorder = <TItem>(
  fills: TItem[],
  commit: (nextFills: TItem[]) => void,
  setSelection: (indices: number[]) => void,
  sourceIndices: number[],
  insertionSlot: number,
  grabbedIndex: number,
  hasMoved: boolean,
): void => commitFillReorder(fills, commit, setSelection, sourceIndices, insertionSlot, grabbedIndex, hasMoved);
