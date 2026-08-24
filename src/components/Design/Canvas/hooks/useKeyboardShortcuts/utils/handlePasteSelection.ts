// components
import { DUPLICATE_OFFSET } from 'components/Design/Canvas/constants';

// store
import { addNode, setSelection } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { cloneNodeWithOffset } from './cloneNodeWithOffset';
import { getClipboardNodes } from './clipboard';

export const handlePasteSelection = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const clipboardNodes = getClipboardNodes();

  if (clipboardNodes.length > 0 && store.getState().design.vectorEditingNodeIds.length === 0) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    clipboardNodes.forEach((node) => dispatch(addNode(cloneNodeWithOffset(node, DUPLICATE_OFFSET, DUPLICATE_OFFSET))));

    const { rootOrder } = store.getState().design;
    dispatch(setSelection(rootOrder.slice(rootOrder.length - clipboardNodes.length)));
    dispatch(endHistoryGesture());
  }
};
