// store
import { AppDispatch, RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getDragDropTargetFrame } from './getDragDropTargetFrame';
import { isSectionNode } from 'utils/canvas/signals/isSectionNode';
import { reparentToDropTarget } from './reparentToDropTarget';

export const resolveSectionDragReparentTarget = (
  dispatch: AppDispatch,
  state: RootState,
  selectedNodes: TSceneNode[],
  point: TPoint,
  renderOrderedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  canvasRefs: TCanvasRefs,
): void => {
  const movedNodeIds = selectedNodes.map((node) => node.id);
  const desiredParentId = getDragDropTargetFrame(movedNodeIds, point, renderOrderedNodes, nodesById, isSectionNode);

  canvasRefs.transform.dropTargetFrameIdRef.current = desiredParentId;
  canvasRefs.transform.autoLayoutReorderPreviewRef.current = null;

  if (desiredParentId !== selectedNodes[0].parentId) {
    reparentToDropTarget(dispatch, state, canvasRefs, movedNodeIds, desiredParentId);
  }
};
