// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TNewNodeDropTarget } from './types';
import { TPoint } from 'types/canvas';

// utils
import { armGridDropTarget } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueDrag/updateDragDropTarget/armGridDropTarget/armGridDropTarget';
import { getGridAutoInsertIndex } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerUp/disarmDrag/getGridAutoInsertIndex';

export const resolveGridNewNodeTarget = (
  canvasRefs: TCanvasRefs,
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  point: TPoint,
): TNewNodeDropTarget => {
  armGridDropTarget(canvasRefs, frame, frame.id, [], nodesById, point);

  canvasRefs.transform.autoLayoutDropTargetRef.current = null;

  return { parentId: frame.id, targetIndex: getGridAutoInsertIndex(frame, canvasRefs.transform.gridDropTargetRef.current!) };
};
