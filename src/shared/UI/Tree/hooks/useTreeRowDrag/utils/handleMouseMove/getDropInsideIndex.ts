// others
import { TREE_DROP_INSIDE_EDGE_RATIO } from '../../constants';

// types
import { THoveredRowSlot } from './getHoveredRowSlot';
import { TTreeItem, TTreeRow } from '../../../../types';

// utils
import { getDraggedBlockRange } from './getDraggedBlockRange';

export const getDropInsideIndex = <T extends TTreeItem>(
  rows: TTreeRow<T>[],
  hoveredSlot: THoveredRowSlot,
  draggedIds: string[],
): number | null => {
  const row = rows[hoveredSlot.index];
  const isContainer = Boolean(row?.canHaveChildren);
  const isWithinMiddleBand =
    hoveredSlot.offsetRatio >= TREE_DROP_INSIDE_EDGE_RATIO && hoveredSlot.offsetRatio <= 1 - TREE_DROP_INSIDE_EDGE_RATIO;

  if (isContainer && isWithinMiddleBand) {
    const [blockStart, blockEnd] = getDraggedBlockRange(rows, draggedIds);
    const isOntoSelfOrSubtree = hoveredSlot.index >= blockStart && hoveredSlot.index < blockEnd;

    if (!isOntoSelfOrSubtree) {
      return hoveredSlot.index;
    }
  }

  return null;
};
