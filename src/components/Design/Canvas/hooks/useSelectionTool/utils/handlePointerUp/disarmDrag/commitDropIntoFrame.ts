// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';
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
    const dropTargetFrameId = canvasRefs.transform.dropTargetFrameIdRef.current;
    const targetFrame = dropTargetFrameId ? page.nodes[dropTargetFrameId] : null;
    const targetParentId = targetFrame && isContainerNode(targetFrame) ? targetFrame.id : null;

    if (targetParentId !== currentParentId) {
      const targetIndex = targetFrame && isContainerNode(targetFrame) ? targetFrame.childIds.length : page.rootOrder.length;
      dispatch(moveNodes({ nodeIds, targetIndex, targetParentId }));
    }
  }
};
