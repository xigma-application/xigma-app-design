// store
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSlotDelta } from './types';

// utils
import { getDropNodeOrder } from '../../getDropNodeOrder';
import { getGridSlotDelta } from './getGridSlotDelta';
import { getLinearSlotDelta } from './getLinearSlotDelta';
import { isAutoLayoutFrame } from '../../handlePointerMove/continueDrag/updateDragDropTarget/isAutoLayoutFrame';
import { isGridFrame } from '../../handlePointerMove/continueDrag/updateDragDropTarget/isGridFrame';

export const getGrabbedSlotDelta = (groupIds: string[], grabbedNodeId: string | null, canvasRefs: TCanvasRefs): TSlotDelta | null => {
  const page = selectActivePage(store.getState());
  const parentId = page.nodes[groupIds[0]]?.parentId ?? null;
  const parent = parentId ? page.nodes[parentId] : null;
  const isSameFrameDrop = canvasRefs.transform.dropTargetFrameIdRef.current === parentId;
  const orderedIds = getDropNodeOrder(groupIds, parent, page.rootOrder);
  const grabbedId = grabbedNodeId && groupIds.includes(grabbedNodeId) ? grabbedNodeId : orderedIds[0];
  const gridHover = canvasRefs.transform.gridDropTargetRef.current;

  switch (true) {
    case isSameFrameDrop && isGridFrame(parent):
      return getGridSlotDelta(parent, orderedIds, grabbedId, gridHover?.frameId === parent.id ? gridHover : null, page.nodes);
    case isSameFrameDrop && isAutoLayoutFrame(parent):
      return getLinearSlotDelta(parent, orderedIds, canvasRefs);
    default:
      return null;
  }
};
