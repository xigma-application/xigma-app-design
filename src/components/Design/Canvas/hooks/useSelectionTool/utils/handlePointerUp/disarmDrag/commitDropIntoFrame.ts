// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';
import { isDropTargetContainer } from 'store/design/utils/nodeHierarchy/isDropTargetContainer';
import { moveNodes } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

export const commitDropIntoFrame = (dispatch: AppDispatch, dragState: TDragState, canvasRefs: TCanvasRefs): void => {
  if (dragState.hasMoved) {
    const page = selectActivePage(store.getState());
    const nodeIds = selectSelectedIds(store.getState());
    const currentParentId = page.nodes[nodeIds[0]]?.parentId ?? null;
    const currentParent = currentParentId ? page.nodes[currentParentId] : null;
    const dropTargetFrameId = canvasRefs.transform.dropTargetFrameIdRef.current;
    const targetFrame = dropTargetFrameId ? page.nodes[dropTargetFrameId] : null;
    const targetParentId = targetFrame && isContainerNode(targetFrame) ? targetFrame.id : null;
    const canDragOutToRoot = currentParent !== null && isDropTargetContainer(currentParent);

    if (targetParentId !== currentParentId && (targetParentId !== null || canDragOutToRoot)) {
      const autoLayoutDropTarget = canvasRefs.transform.autoLayoutDropTargetRef.current;
      const targetIndex =
        autoLayoutDropTarget && autoLayoutDropTarget.frameId === targetParentId
          ? autoLayoutDropTarget.index
          : targetFrame && isContainerNode(targetFrame)
            ? targetFrame.childIds.length
            : page.rootOrder.length;

      dispatch(moveNodes({ nodeIds, targetIndex, targetParentId }));
    }
  }
};
