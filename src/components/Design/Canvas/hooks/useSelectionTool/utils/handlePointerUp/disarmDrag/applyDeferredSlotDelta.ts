// store
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TSlotDelta } from './types';

// utils
import { applyGridSlotDelta } from './applyGridSlotDelta';
import { applyLinearSlotDelta } from './applyLinearSlotDelta';
import { getDropNodeOrder } from '../../getDropNodeOrder';
import { isAutoLayoutFrame } from '../../handlePointerMove/continueDrag/updateDragDropTarget/isAutoLayoutFrame';
import { isGridFrame } from '../../handlePointerMove/continueDrag/updateDragDropTarget/isGridFrame';

export const applyDeferredSlotDelta = (dispatch: AppDispatch, groupIds: string[], slotDelta: TSlotDelta): void => {
  const page = selectActivePage(store.getState());
  const { parentId } = page.nodes[groupIds[0]];
  const parent = parentId ? page.nodes[parentId] : null;
  const orderedIds = getDropNodeOrder(groupIds, parent, page.rootOrder);

  if (isGridFrame(parent)) {
    applyGridSlotDelta(dispatch, parent, orderedIds, slotDelta, page.nodes);
  } else if (isAutoLayoutFrame(parent)) {
    applyLinearSlotDelta(dispatch, parent, orderedIds, slotDelta);
  }
};
