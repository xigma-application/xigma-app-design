// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridInsertPlacements } from 'utils/canvas/gridSlots/getGridInsertPlacements/getGridInsertPlacements';

export const applyGridInsert = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  insertIndex: number,
  draggedIds: string[],
): void => {
  const { dragged, shifted } = getGridInsertPlacements(frame, nodesById, draggedIds, insertIndex);

  dispatch(updateNode({ changes: { gridAutoPlacement: false }, id: frame.id }));

  shifted.forEach(({ cell, id }) => {
    dispatch(updateNode({ changes: { gridColumnAnchorIndex: cell.column, gridRowAnchorIndex: cell.row }, id }));
  });

  draggedIds.forEach((id, index) => {
    dispatch(
      updateNode({
        changes: {
          gridColumnAnchorIndex: dragged[index].column,
          gridRowAnchorIndex: dragged[index].row,
          heightSizingMode: SizingMode.fill,
          widthSizingMode: SizingMode.fill,
        },
        id,
      }),
    );
  });
};
