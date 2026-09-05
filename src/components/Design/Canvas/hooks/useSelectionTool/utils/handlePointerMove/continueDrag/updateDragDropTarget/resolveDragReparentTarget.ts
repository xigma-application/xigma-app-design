// store
import { isDropTargetContainer } from 'store/design/utils/nodeHierarchy/isDropTargetContainer';
import { AppDispatch, RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutDropTarget } from './armAutoLayoutDropTarget';
import { getDragDropTargetFrame } from './getDragDropTargetFrame';
import { isAutoLayoutFrame } from './isAutoLayoutFrame';
import { reparentToDropTarget } from './reparentToDropTarget';

export const resolveDragReparentTarget = (
  dispatch: AppDispatch,
  state: RootState,
  selectedNodes: TSceneNode[],
  point: TPoint,
  renderOrderedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  canvasRefs: TCanvasRefs,
): void => {
  const currentParent = selectedNodes[0].parentId ? nodesById[selectedNodes[0].parentId] : null;
  const currentParentId = currentParent?.id ?? null;
  const movedNodeIds = selectedNodes.map((node) => node.id);
  const desiredParentId = getDragDropTargetFrame(movedNodeIds, point, renderOrderedNodes, nodesById);
  const canDragOutToRoot = currentParent !== null && isDropTargetContainer(currentParent);
  const desiredParent = desiredParentId ? nodesById[desiredParentId] : null;

  canvasRefs.transform.dropTargetFrameIdRef.current = desiredParentId;

  switch (true) {
    case isAutoLayoutFrame(desiredParent) && desiredParentId !== null:
      armAutoLayoutDropTarget(canvasRefs, desiredParent, desiredParentId, currentParentId, selectedNodes, movedNodeIds, nodesById, point);
      break;
    case desiredParentId !== currentParentId && (desiredParentId !== null || canDragOutToRoot):
      reparentToDropTarget(dispatch, state, canvasRefs, movedNodeIds, desiredParentId);
      break;
    default:
      canvasRefs.transform.autoLayoutReorderPreviewRef.current = null;
  }
};
