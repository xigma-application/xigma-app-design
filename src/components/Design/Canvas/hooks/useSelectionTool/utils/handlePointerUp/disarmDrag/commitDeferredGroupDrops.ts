// store
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TSlotDelta } from './types';

// utils
import { applyDeferredSlotDelta } from './applyDeferredSlotDelta';
import { armDeferredGroupDropTarget } from './armDeferredGroupDropTarget';
import { commitGroupDrop } from './commitGroupDrop';
import { getDeferredDragNodes } from '../../dragGroups/getDeferredDragNodes';
import { getGrabbedDragGroup } from '../../dragGroups/getGrabbedDragGroup';
import { getSelectionGroups } from 'components/Design/Canvas/utils/getSelectionGroups';

const clearDropTargetRefs = (canvasRefs: TCanvasRefs): void => {
  canvasRefs.transform.autoLayoutDropTargetRef.current = null;
  canvasRefs.transform.autoLayoutReorderPreviewRef.current = null;
  canvasRefs.transform.dropTargetFrameIdRef.current = null;
  canvasRefs.transform.gridDropTargetRef.current = null;
};

export const commitDeferredGroupDrops = (
  dispatch: AppDispatch,
  dragState: TDragState,
  canvasRefs: TCanvasRefs,
  slotDelta: TSlotDelta | null,
): void => {
  if (dragState.delta && !dragState.reorderModeAbandoned) {
    const { nodes } = selectActivePage(store.getState());
    const selectedNodes = selectSelectedIds(store.getState())
      .map((id) => nodes[id])
      .filter(Boolean);
    const grabbedGroup = getGrabbedDragGroup(selectedNodes, dragState.grabbedNodeId ?? null);
    const deferredGroups = getSelectionGroups(getDeferredDragNodes(selectedNodes, grabbedGroup, nodes));

    deferredGroups.forEach((group) => {
      const groupIds = group.map((node) => node.id);

      if (slotDelta) {
        applyDeferredSlotDelta(dispatch, groupIds, slotDelta);
      } else {
        clearDropTargetRefs(canvasRefs);
        armDeferredGroupDropTarget(canvasRefs, groupIds, dragState.delta!);
        commitGroupDrop(dispatch, groupIds, canvasRefs);
      }
    });

    clearDropTargetRefs(canvasRefs);
  }
};
