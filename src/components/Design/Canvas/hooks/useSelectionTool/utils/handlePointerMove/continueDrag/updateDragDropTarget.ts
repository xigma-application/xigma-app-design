// store
import { moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, RootState } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getDragDropTargetFrame } from './getDragDropTargetFrame';

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

  const canReparent = selectedNodes.length > 0 && !selectedNodes.some((node) => node.type === NodeType.section);

  if (canReparent) {
    const currentParentId = selectedNodes[0].parentId ?? null;
    const movedNodeIds = selectedNodes.map((node) => node.id);
    const desiredParentId = getDragDropTargetFrame(movedNodeIds, point, renderOrderedNodes, nodesById);

    canvasRefs.transform.dropTargetFrameIdRef.current = desiredParentId;

    if (desiredParentId !== currentParentId) {
      const page = selectActivePage(state);
      const targetParent = desiredParentId ? page.nodes[desiredParentId] : null;
      const targetIndex = targetParent?.type === NodeType.frame ? targetParent.childIds.length : page.rootOrder.length;

      dispatch(moveNodes({ nodeIds: movedNodeIds, targetIndex, targetParentId: desiredParentId }));
    }
  }
};
