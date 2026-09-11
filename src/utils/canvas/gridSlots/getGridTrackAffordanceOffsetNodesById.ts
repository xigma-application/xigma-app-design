// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';

// utils
import { getAutoLayoutSyncChildren } from 'store/design/utils/autoLayout/syncAutoLayoutChildren/getAutoLayoutSyncChildren';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { placeGridCells } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells';

export const getGridTrackAffordanceOffsetNodesById = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  dragState: TGridTrackAffordanceDragState,
  offset: number,
): Record<string, TSceneNode> => {
  const isColumn = dragState.axis === 'column';
  const { sizes } = getAutoLayoutSyncChildren(frame, nodesById);
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const placements = placeGridCells(sizes, columnCount, frame.gridAutoPlacement ?? true);
  const affectedIds = placements
    .filter((placement) => {
      const start = isColumn ? placement.columnStart : placement.rowStart;
      const span = isColumn ? placement.columnSpan : placement.rowSpan;

      return dragState.sourceIndices.some((index) => index >= start && index < start + span);
    })
    .map((placement) => placement.id);

  if (affectedIds.length !== 0 && offset !== 0) {
    const next = { ...nodesById };

    affectedIds.forEach((id) => {
      const node = next[id];

      if (node && isBoxSceneNode(node)) {
        next[id] = isColumn ? { ...node, x: node.x + offset } : { ...node, y: node.y + offset };
      }
    });

    return next;
  }

  return nodesById;
};
