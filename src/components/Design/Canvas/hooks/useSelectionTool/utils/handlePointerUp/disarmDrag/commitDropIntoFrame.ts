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

// utils
import { applyGridDrop } from './applyGridDrop';
import { applyGridInsert } from './applyGridInsert';
import { fillSizeNodesForGridAutoInsert } from './fillSizeNodesForGridAutoInsert';
import { getDropNodeOrder } from '../../getDropNodeOrder';
import { getGridAutoInsertIndex } from './getGridAutoInsertIndex';
import { resolveDropTargetIndex } from './resolveDropTargetIndex';

export const commitDropIntoFrame = (dispatch: AppDispatch, dragState: TDragState, canvasRefs: TCanvasRefs): void => {
  if (dragState.hasMoved) {
    const page = selectActivePage(store.getState());
    const selectedIds = selectSelectedIds(store.getState());
    const currentParentId = page.nodes[selectedIds[0]]?.parentId ?? null;
    const currentParent = currentParentId ? page.nodes[currentParentId] : null;
    const nodeIds = getDropNodeOrder(selectedIds, currentParent, page.rootOrder);
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
    const isRepositioningExistingGridChild = isGridDrop && targetParentId === currentParentId;
    const isGridFrameTarget = targetFrame?.type === NodeType.frame;
    const targetGridAutoPlacement = isGridFrameTarget && (targetFrame.gridAutoPlacement ?? true);
    const gridAutoPlacementBlocksReposition = isRepositioningExistingGridChild && targetGridAutoPlacement;
    const isNewGridInsertUnderAutoPlacement =
      isGridDrop && !isRepositioningExistingGridChild && isGridFrameTarget && targetGridAutoPlacement;
    const gridAutoInsertIndex =
      isNewGridInsertUnderAutoPlacement && gridDropTarget ? getGridAutoInsertIndex(targetFrame, gridDropTarget) : null;

    if (
      !gridAutoPlacementBlocksReposition &&
      (matchingReorderPreview ||
        isSameParentIndicatorDrop ||
        isGridDrop ||
        (targetParentId !== currentParentId && (targetParentId !== null || canDragOutToRoot)))
    ) {
      const targetIndex = resolveDropTargetIndex({
        autoLayoutDropTarget,
        gridAutoInsertIndex,
        matchingReorderPreview,
        page,
        targetFrame,
        targetParentId,
      });

      dispatch(moveNodes({ nodeIds, targetIndex, targetParentId }));

      if (isGridDrop && gridDropTarget && targetParentId) {
        if (isNewGridInsertUnderAutoPlacement) {
          fillSizeNodesForGridAutoInsert(dispatch, nodeIds);
        } else if (gridDropTarget.insertIndex !== undefined && targetFrame?.type === NodeType.frame) {
          applyGridInsert(dispatch, targetFrame, page.nodes, gridDropTarget.insertIndex, nodeIds);
        } else {
          applyGridDrop(dispatch, targetParentId, gridDropTarget.cells, nodeIds);
        }
      }
    }
  }
};
