// types
import { TTreeItem, TTreeRow } from '../../../../types';

export const getDraggedBlockRange = <T extends TTreeItem>(rows: TTreeRow<T>[], draggedIds: string[]): [number, number] => {
  const draggedIdSet = new Set(draggedIds);
  const startIndex = rows.findIndex((row) => draggedIdSet.has(row.item.id));

  if (startIndex !== -1) {
    const blockDepth = rows[startIndex].depth;
    const tailOffset = rows.slice(startIndex + 1).findIndex((row) => row.depth <= blockDepth && !draggedIdSet.has(row.item.id));

    return [startIndex, tailOffset === -1 ? rows.length : startIndex + 1 + tailOffset];
  }

  return [-1, -1];
};
