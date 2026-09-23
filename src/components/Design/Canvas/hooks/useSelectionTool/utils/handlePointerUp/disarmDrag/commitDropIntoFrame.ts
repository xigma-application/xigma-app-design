// store
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { commitDeferredGroupDrops } from './commitDeferredGroupDrops';
import { commitGroupDrop } from './commitGroupDrop';
import { getGrabbedSlotDelta } from './getGrabbedSlotDelta';
import { getGrabbedDragGroup } from '../../dragGroups/getGrabbedDragGroup';

const getSelectedNodes = (): TSceneNode[] => {
  const { nodes } = selectActivePage(store.getState());

  return selectSelectedIds(store.getState())
    .map((id) => nodes[id])
    .filter(Boolean);
};

export const commitDropIntoFrame = (dispatch: AppDispatch, dragState: TDragState, canvasRefs: TCanvasRefs): void => {
  if (dragState.hasMoved) {
    const selectedNodes = getSelectedNodes();
    const grabbedGroup = getGrabbedDragGroup(selectedNodes, dragState.grabbedNodeId ?? null);
    const grabbedIds = grabbedGroup.map((node) => node.id);
    const slotDelta = getGrabbedSlotDelta(grabbedIds, dragState.grabbedNodeId ?? null, canvasRefs);

    commitGroupDrop(dispatch, grabbedIds, canvasRefs);
    commitDeferredGroupDrops(dispatch, dragState, canvasRefs, slotDelta);
  }
};
