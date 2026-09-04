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
import { cloneNodeSubtreeWithOffset } from './cloneNodeSubtreeWithOffset';
import { collectSubtreeNodes } from './collectSubtreeNodes';
import { duplicateVectorFragment } from './duplicateVectorFragment/duplicateVectorFragment';
import { reparentDuplicatedRoots } from './reparentDuplicatedRoots';

export const handleDuplicateSelection = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const state = store.getState();
  const { nodes } = selectActivePage(state);
  const selectedIds = selectSelectedIds(state);
  const { vectorEditingNodeIds } = state.design;
  const selectedVertexIds = refs.vectorEdit.selectedVectorVertexIdsRef.current;
  const selectedSegmentIds = refs.vectorEdit.selectedVectorSegmentIdsRef.current;

  if (selectedVertexIds.length > 0 || selectedSegmentIds.length > 0) {
    duplicateVectorFragment(dispatch, refs, nodes, vectorEditingNodeIds, selectedVertexIds, selectedSegmentIds);
  } else if (selectedIds.length > 0 && vectorEditingNodeIds.length === 0) {
    const subtreeNodes = collectSubtreeNodes(nodes, selectedIds);
    const cloned = cloneNodeSubtreeWithOffset(subtreeNodes, selectedIds, DUPLICATE_OFFSET, DUPLICATE_OFFSET);

    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    dispatch(addNodes({ nodes: cloned.nodes, rootIds: cloned.rootIds }));
    reparentDuplicatedRoots(dispatch, nodes, selectedIds, cloned.rootIds);
    dispatch(setSelection(cloned.rootIds));
    dispatch(endHistoryGesture());
  }
};
