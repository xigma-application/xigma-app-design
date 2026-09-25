// store
import { AppDispatch, RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { isSectionNode } from 'utils/canvas/signals/isSectionNode';
import { resolveDragReparentTarget } from './resolveDragReparentTarget';
import { resolveSectionDragReparentTarget } from './resolveSectionDragReparentTarget';

export const updateDragDropTarget = (
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
  canvasRefs.transform.dropTargetFrameIdRef.current = null;
  canvasRefs.transform.autoLayoutDropTargetRef.current = null;
  canvasRefs.transform.gridDropTargetRef.current = null;

  const isEverySection = selectedNodes.length > 0 && selectedNodes.every(isSectionNode);
  const canReparent = selectedNodes.length > 0 && !selectedNodes.some(isSectionNode);

  switch (true) {
    case canReparent:
      resolveDragReparentTarget(
        dispatch,
        state,
        selectedNodes,
        point,
        renderOrderedNodes,
        nodesById,
        canvasRefs,
        grabbedNodeId,
        isModifierHeld,
        dragState,
      );
      break;
    case isEverySection:
      resolveSectionDragReparentTarget(dispatch, state, selectedNodes, point, renderOrderedNodes, nodesById, canvasRefs);
      break;
    default:
      canvasRefs.transform.autoLayoutReorderPreviewRef.current = null;
  }
};
