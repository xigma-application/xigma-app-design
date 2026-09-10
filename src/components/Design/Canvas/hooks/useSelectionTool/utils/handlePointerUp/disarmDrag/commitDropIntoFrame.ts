// others
import { applyGridDrop } from './applyGridDrop';
import { resolveDropTargetIndex } from './resolveDropTargetIndex';

// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';
import { isDropTargetContainer } from 'store/design/utils/nodeHierarchy/isDropTargetContainer';
import { moveNodes } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

export const commitDropIntoFrame = (dispatch: AppDispatch, dragState: TDragState, canvasRefs: TCanvasRefs): void => {
  if (dragState.hasMoved) {
    const page = selectActivePage(store.getState());
    const selectedIds = selectSelectedIds(store.getState());
    const currentParentId = page.nodes[selectedIds[0]]?.parentId ?? null;
    const currentParent = currentParentId ? page.nodes[currentParentId] : null;
    const currentSiblingOrder = currentParent && isContainerNode(currentParent) ? currentParent.childIds : page.rootOrder;
    const orderedFromCurrentParent = currentSiblingOrder.filter((id) => selectedIds.includes(id));
    const nodeIds = [...orderedFromCurrentParent, ...selectedIds.filter((id) => !orderedFromCurrentParent.includes(id))];
    const dropTargetFrameId = canvasRefs.transform.dropTargetFrameIdRef.current;
    const targetFrame = dropTargetFrameId ? page.nodes[dropTargetFrameId] : null;
    const targetParentId = targetFrame && isContainerNode(targetFrame) ? targetFrame.id : null;
    const canDragOutToRoot = currentParent !== null && isDropTargetContainer(currentParent);
    const reorderPreview = canvasRefs.transform.autoLayoutReorderPreviewRef.current;
    const autoLayoutDropTarget = canvasRefs.transform.autoLayoutDropTargetRef.current;
    const gridDropTarget = canvasRefs.transform.gridDropTargetRef.current;
    const matchingReorderPreview =
      targetParentId !== null && targetParentId === currentParentId && reorderPreview?.frameId === targetParentId ? reorderPreview : null;
    const isSameParentIndicatorDrop =
      targetParentId !== null && targetParentId === currentParentId && autoLayoutDropTarget?.frameId === targetParentId;
    const isGridDrop = targetParentId !== null && gridDropTarget?.frameId === targetParentId;

    if (
      matchingReorderPreview ||
      isSameParentIndicatorDrop ||
      isGridDrop ||
      (targetParentId !== currentParentId && (targetParentId !== null || canDragOutToRoot))
    ) {
      const targetIndex = resolveDropTargetIndex({
        autoLayoutDropTarget,
        matchingReorderPreview,
        page,
        targetFrame,
        targetParentId,
      });

      dispatch(moveNodes({ nodeIds, targetIndex, targetParentId }));

      if (isGridDrop && gridDropTarget && targetFrame && targetFrame.type === NodeType.frame) {
        applyGridDrop(dispatch, targetFrame, gridDropTarget, nodeIds);
      }
    }
  }
};
