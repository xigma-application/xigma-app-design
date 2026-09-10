// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getGridDropCell } from 'utils/canvas/gridSlots/getGridDropCell';
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';
import { getUnrotatedQueryPoint } from 'components/Design/Canvas/utils/getUnrotatedQueryPoint';

export const armGridDropTarget = (
  canvasRefs: TCanvasRefs,
  frame: TFrameNode,
  frameId: string,
  movedNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
  point: TPoint,
): void => {
  const layout = getGridTrackLayout(frame, nodesById);
  const unrotated = getUnrotatedQueryPoint(point, frame, frame.rotation);
  const framePoint: TPoint = { x: unrotated.x - frame.x, y: unrotated.y - frame.y };
  const { column, row } = getGridDropCell(layout, framePoint);

  canvasRefs.transform.gridDropTargetRef.current = {
    columnStart: column,
    count: Math.max(movedNodeIds.length, 1),
    frameId,
    rowStart: row,
  };
};
