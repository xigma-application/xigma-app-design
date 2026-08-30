// types
import { TTreeItem, TTreeRow } from '../../../../types';

export type TResolvedTreeDrop<T> = {
  draggedItems: T[];
  targetIndex: number;
  targetParentItem: T | null;
};

const findAncestorItemAtDepth = <T extends TTreeItem>(remainingRows: TTreeRow<T>[], toIndex: number, depth: number): T | null => {
  const ancestorRow = remainingRows
    .slice(0, toIndex)
    .reverse()
    .find((row) => row.depth === depth);

  return ancestorRow?.item ?? null;
};

export const resolveTreeDrop = <T extends TTreeItem>(
  rows: TTreeRow<T>[],
  fromIndices: number[],
  toIndex: number,
  toDepth: number,
): TResolvedTreeDrop<T> | null => {
  const draggedRows = fromIndices.map((index) => rows[index]).filter((row): row is TTreeRow<T> => Boolean(row));
  const sourceParentId = draggedRows[0]?.parentItem?.id ?? null;
  const isSameParent = draggedRows.every((row) => (row.parentItem?.id ?? null) === sourceParentId);

  if (draggedRows.length > 0 && isSameParent) {
    const draggedIndexSet = new Set(fromIndices);
    const remainingRows = rows.filter((_, index) => !draggedIndexSet.has(index));
    const targetParentItem = toDepth === 0 ? null : findAncestorItemAtDepth(remainingRows, toIndex, toDepth - 1);

    if (toDepth === 0 || targetParentItem) {
      const targetParentId = targetParentItem?.id ?? null;
      const targetIndex = remainingRows.slice(0, toIndex).filter((row) => (row.parentItem?.id ?? null) === targetParentId).length;

      return { draggedItems: draggedRows.map((row) => row.item), targetIndex, targetParentItem };
    }
  }

  return null;
};
