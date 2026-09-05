// types
import { TArmedRowDrag, TTreeDragState } from '../../types';
import { TTreeItem, TTreeRow } from '../../../../types';

// utils
import { clearSpringLoad } from '../springLoad/clearSpringLoad';
import { getIsReorderNoOp } from './getIsReorderNoOp';
import { getReorderedInsertionIndex } from './getReorderedInsertionIndex';
import { resolveTreeDrop } from './resolveTreeDrop';
import { resyncArmedIndices } from '../resyncArmedIndices';

type TOnReorder<T> = (draggedItems: T[], targetParentItem: T | null, targetIndex: number) => void;

const handleDropInside = <T extends TTreeItem>(
  rows: TTreeRow<T>[],
  armed: TArmedRowDrag,
  dropInsideIndex: number,
  onReorder: TOnReorder<T> | undefined,
): void => {
  const container = rows[dropInsideIndex];
  const draggedItems = armed.indices
    .map((index) => rows[index])
    .filter((row): row is TTreeRow<T> => Boolean(row))
    .map((row) => row.item);

  if (container && draggedItems.length > 0) {
    const childCount = rows.filter((row) => row.parentItem?.id === container.item.id).length;
    onReorder?.(draggedItems, container.item, childCount);
  }
};

const handleReorderDrop = <T extends TTreeItem>(
  rows: TTreeRow<T>[],
  armed: TArmedRowDrag,
  insertionIndex: number,
  dropDepth: number,
  onReorder: TOnReorder<T> | undefined,
  isForwardOrderParent: ((parentItem: T | null) => boolean) | undefined,
): void => {
  const canReorder = !getIsReorderNoOp(armed.indices, insertionIndex, dropDepth !== armed.depth);

  if (canReorder) {
    const toIndex = getReorderedInsertionIndex(armed.indices, insertionIndex);
    const resolved = resolveTreeDrop(rows, armed.indices, toIndex, dropDepth, isForwardOrderParent);

    if (resolved) {
      onReorder?.(resolved.draggedItems, resolved.targetParentItem, resolved.targetIndex);
    }
  }
};

export const handleMouseUp = <T extends TTreeItem>(
  rows: TTreeRow<T>[],
  dragState: TTreeDragState,
  onReorder: TOnReorder<T> | undefined,
  isForwardOrderParent?: (parentItem: T | null) => boolean,
): void => {
  const armed = dragState.armedRef.current;

  if (armed) {
    resyncArmedIndices(armed, rows);
  }

  if (armed && dragState.dropInsideIndex !== null) {
    handleDropInside(rows, armed, dragState.dropInsideIndex, onReorder);
  } else if (armed && dragState.insertionIndex !== null) {
    handleReorderDrop(rows, armed, dragState.insertionIndex, dragState.dropDepth, onReorder, isForwardOrderParent);
  }

  clearSpringLoad(dragState.springLoadRef);
  dragState.armedRef.current = null;
  dragState.setInsertionIndex(null);
  dragState.setDropDepth(0);
  dragState.setDropInsideIndex(null);
};
