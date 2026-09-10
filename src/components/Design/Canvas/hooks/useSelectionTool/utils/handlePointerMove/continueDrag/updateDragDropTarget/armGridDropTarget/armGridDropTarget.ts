// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';
import { getUnrotatedQueryPoint } from 'components/Design/Canvas/utils/getUnrotatedQueryPoint';
import { resolveGridDropHover } from 'utils/canvas/gridSlots/resolveGridDropHover';

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
  const hover = resolveGridDropHover(frame, nodesById, movedNodeIds, framePoint, layout);

  canvasRefs.transform.gridDropTargetRef.current = { ...hover, frameId };
};
