// types
import { TAutoLayoutFrame } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueDrag/updateDragDropTarget/types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TNewNodeDropTarget } from './types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutDropTarget } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueDrag/updateDragDropTarget/armAutoLayoutDropTarget/armAutoLayoutDropTarget';
import { buildPendingNewNodePlaceholder } from './buildPendingNewNodePlaceholder';

export const resolveAutoLayoutNewNodeTarget = (
  canvasRefs: TCanvasRefs,
  frame: TAutoLayoutFrame,
  nodesById: Record<string, TSceneNode>,
  point: TPoint,
): TNewNodeDropTarget => {
  const placeholder = buildPendingNewNodePlaceholder(point);

  armAutoLayoutDropTarget(canvasRefs, frame, frame.id, null, [placeholder], [placeholder.id], nodesById, point, null, true);
  canvasRefs.transform.gridDropTargetRef.current = null;

  return { parentId: frame.id, targetIndex: canvasRefs.transform.autoLayoutDropTargetRef.current!.index };
};
