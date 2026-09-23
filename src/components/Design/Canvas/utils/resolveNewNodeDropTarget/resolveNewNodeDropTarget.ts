// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutFrame } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueDrag/updateDragDropTarget/types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TNewNodeDropTarget } from './types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getFrameAtWorldPoint } from '../getFrameAtWorldPoint';
import { resolveAutoLayoutNewNodeTarget } from './resolveAutoLayoutNewNodeTarget';
import { resolveFreeformNewNodeTarget } from './resolveFreeformNewNodeTarget';
import { resolveGridNewNodeTarget } from './resolveGridNewNodeTarget';

export const resolveNewNodeDropTarget = (
  canvasRefs: TCanvasRefs,
  point: TPoint,
  renderOrderedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  rootOrder: string[],
): TNewNodeDropTarget => {
  const frame = getFrameAtWorldPoint(point, renderOrderedNodes);

  canvasRefs.transform.dropTargetFrameIdRef.current = frame?.id ?? null;

  if (frame) {
    switch (frame.layoutMode) {
      case LayoutMode.grid:
        return resolveGridNewNodeTarget(canvasRefs, frame, nodesById, point);
      case LayoutMode.horizontal:
      case LayoutMode.vertical:
        return resolveAutoLayoutNewNodeTarget(canvasRefs, frame as TAutoLayoutFrame, nodesById, point);
      default:
        return resolveFreeformNewNodeTarget(canvasRefs, frame);
    }
  }

  canvasRefs.transform.autoLayoutDropTargetRef.current = null;
  canvasRefs.transform.gridDropTargetRef.current = null;

  return { parentId: null, targetIndex: rootOrder.length };
};
