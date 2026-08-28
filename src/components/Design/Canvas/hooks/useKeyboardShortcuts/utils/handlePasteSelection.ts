// components
import { DUPLICATE_OFFSET } from 'components/Design/Canvas/constants';

// store
import { addNode, setSelection } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { cloneNodeWithOffset } from './cloneNodeWithOffset';
import { getClipboardNodes } from './clipboard';
import { getVectorClipboardFragment } from './vectorClipboard';
import { pasteVectorFragment } from './pasteVectorFragment';

export const handlePasteSelection = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const state = store.getState();
  const { nodes } = selectActivePage(state);
  const { vectorEditingNodeIds } = state.design;

  if (vectorEditingNodeIds.length > 0) {
    const vectorFragment = getVectorClipboardFragment();

    if (vectorFragment && vectorFragment.vertices.length > 0) {
      pasteVectorFragment(dispatch, refs, nodes, vectorEditingNodeIds, vectorFragment);
    }
  } else {
    const clipboardNodes = getClipboardNodes();

    if (clipboardNodes.length > 0) {
      dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
      clipboardNodes.forEach((node) => dispatch(addNode(cloneNodeWithOffset(node, DUPLICATE_OFFSET, DUPLICATE_OFFSET))));

      const { rootOrder } = selectActivePage(store.getState());
      dispatch(setSelection(rootOrder.slice(rootOrder.length - clipboardNodes.length)));
      dispatch(endHistoryGesture());
    }
  }
};
