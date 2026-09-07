// store
import { isDropTargetContainer } from 'store/design/utils/nodeHierarchy/isDropTargetContainer';
import { AppDispatch, RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutDropTarget } from './armAutoLayoutDropTarget/armAutoLayoutDropTarget';
import { getDragDropTargetFrame } from './getDragDropTargetFrame';
import { isAutoLayoutFrame } from './isAutoLayoutFrame';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isPointInsideFrame } from './isPointInsideFrame';
import { reparentToDropTarget } from './reparentToDropTarget';

const applyDesiredDropTarget = (
  canvasRefs: TCanvasRefs,
  isReorderContext: boolean,
  isModifierHeld: boolean,
  desiredParentId: string | null,
  currentParentId: string | null,
  dragState: TDragState,
): void => {
  if (isReorderContext && isModifierHeld && desiredParentId !== currentParentId) {
    dragState.reorderModeAbandoned = true;
  }

  canvasRefs.transform.dropTargetFrameIdRef.current = desiredParentId;
};

export const resolveDragReparentTarget = (
  dispatch: AppDispatch,
  state: RootState,
  selectedNodes: TSceneNode[],
  point: TPoint,
  renderOrderedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  canvasRefs: TCanvasRefs,
  grabbedNodeId: string | null,
  isModifierHeld: boolean,
  dragState: TDragState,
): void => {
  const currentParent = selectedNodes[0].parentId ? nodesById[selectedNodes[0].parentId] : null;
  const currentParentId = currentParent?.id ?? null;
  const movedNodeIds = selectedNodes.map((node) => node.id);
  const grabbedNode = selectedNodes[0];
  const isAbsoluteChild = isBoxSceneNode(grabbedNode) && Boolean(grabbedNode.ignoreAutoLayout);
  const isReorderContext = isAutoLayoutFrame(currentParent) && !isAbsoluteChild && !dragState.reorderModeAbandoned;
  const suppressReorder = isModifierHeld || Boolean(dragState.reorderModeAbandoned);
  const isLockedToReorder =
    isAutoLayoutFrame(currentParent) && !isAbsoluteChild && isPointInsideFrame(point, currentParent) && !suppressReorder;
  const desiredParentId = isLockedToReorder ? currentParentId : getDragDropTargetFrame(movedNodeIds, point, renderOrderedNodes, nodesById);
  const canDragOutToRoot = currentParent !== null && isDropTargetContainer(currentParent);
  const desiredParent = desiredParentId ? nodesById[desiredParentId] : null;

  applyDesiredDropTarget(canvasRefs, isReorderContext, isModifierHeld, desiredParentId, currentParentId, dragState);

  switch (true) {
    case isAutoLayoutFrame(desiredParent) && desiredParentId !== null && !isAbsoluteChild:
      armAutoLayoutDropTarget(
        canvasRefs,
        desiredParent,
        desiredParentId,
        currentParentId,
        selectedNodes,
        movedNodeIds,
        nodesById,
        point,
        grabbedNodeId,
        suppressReorder,
      );
      break;
    case desiredParentId !== currentParentId && (desiredParentId !== null || canDragOutToRoot):
      reparentToDropTarget(dispatch, state, canvasRefs, movedNodeIds, desiredParentId);
      break;
    default:
      canvasRefs.transform.autoLayoutReorderPreviewRef.current = null;
  }
};
