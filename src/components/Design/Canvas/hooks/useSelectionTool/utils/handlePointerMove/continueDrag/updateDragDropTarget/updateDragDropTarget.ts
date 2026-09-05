// store
import { AppDispatch, RootState } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { resolveDragReparentTarget } from './resolveDragReparentTarget';

export const updateDragDropTarget = (
  dispatch: AppDispatch,
  state: RootState,
  selectedNodes: TSceneNode[],
  point: TPoint,
  renderOrderedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  canvasRefs: TCanvasRefs,
): void => {
  canvasRefs.transform.dropTargetFrameIdRef.current = null;
  canvasRefs.transform.autoLayoutDropTargetRef.current = null;

  const canReparent = selectedNodes.length > 0 && !selectedNodes.some((node) => node.type === NodeType.section);

  if (canReparent) {
    resolveDragReparentTarget(dispatch, state, selectedNodes, point, renderOrderedNodes, nodesById, canvasRefs);
  } else {
    canvasRefs.transform.autoLayoutReorderPreviewRef.current = null;
  }
};
