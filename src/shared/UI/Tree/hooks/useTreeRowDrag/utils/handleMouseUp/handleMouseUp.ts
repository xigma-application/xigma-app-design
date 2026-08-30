// types
import { TTreeDragState } from '../../types';
import { TTreeItem, TTreeRow } from '../../../../types';

// utils
import { getIsReorderNoOp } from './getIsReorderNoOp';
import { getReorderedInsertionIndex } from './getReorderedInsertionIndex';
import { resolveTreeDrop } from './resolveTreeDrop';

export const handleMouseUp = <T extends TTreeItem>(
  rows: TTreeRow<T>[],
  dragState: TTreeDragState,
  onReorder: ((draggedItems: T[], targetParentItem: T | null, targetIndex: number) => void) | undefined,
): void => {
  const armed = dragState.armedRef.current;

  if (armed && dragState.insertionIndex !== null) {
    const canReorder = !getIsReorderNoOp(armed.indices, dragState.insertionIndex, dragState.dropDepth !== armed.depth);

    if (canReorder) {
      const toIndex = getReorderedInsertionIndex(armed.indices, dragState.insertionIndex);
      const resolved = resolveTreeDrop(rows, armed.indices, toIndex, dragState.dropDepth);

      if (resolved) {
        onReorder?.(resolved.draggedItems, resolved.targetParentItem, resolved.targetIndex);
      }
    }
  }

  dragState.armedRef.current = null;
  dragState.setInsertionIndex(null);
  dragState.setDropDepth(0);
};
