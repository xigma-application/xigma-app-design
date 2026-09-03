// components
import { DUPLICATE_OFFSET } from 'components/Design/Canvas/constants';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { canReplaceSelectionWithClipboard } from './canReplaceSelectionWithClipboard';
import { cloneNodeSubtreeWithOffset } from './cloneNodeSubtreeWithOffset';
import { getClipboardNodes } from './clipboard';
import { getVectorClipboardFragment } from './vectorClipboard';
import { handlePasteToReplace } from './handlePasteToReplace';
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
    const clipboard = getClipboardNodes();
    const selectedIds = selectSelectedIds(state);

    if (canReplaceSelectionWithClipboard(selectedIds, clipboard.rootIds)) {
      handlePasteToReplace(dispatch);
    } else if (clipboard.nodes.length > 0) {
      const cloned = cloneNodeSubtreeWithOffset(clipboard.nodes, clipboard.rootIds, DUPLICATE_OFFSET, DUPLICATE_OFFSET);

      dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
      dispatch(addNodes({ nodes: cloned.nodes, rootIds: cloned.rootIds }));
      dispatch(setSelection(cloned.rootIds));
      dispatch(endHistoryGesture());
    }
  }
};
