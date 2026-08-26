// components
import { DUPLICATE_OFFSET } from 'components/Design/Canvas/constants';

// store
import { addNode, setSelection } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectOrderedNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { cloneNodeWithOffset } from './cloneNodeWithOffset';
import { duplicateVectorFragment } from './duplicateVectorFragment/duplicateVectorFragment';

export const handleDuplicateSelection = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const state = store.getState();
  const { nodes, selectedIds, vectorEditingNodeIds } = state.design;
  const selectedVertexIds = refs.selectedVectorVertexIdsRef.current;
  const selectedSegmentIds = refs.selectedVectorSegmentIdsRef.current;

  if (selectedVertexIds.length > 0 || selectedSegmentIds.length > 0) {
    duplicateVectorFragment(dispatch, refs, nodes, vectorEditingNodeIds, selectedVertexIds, selectedSegmentIds);
  } else if (selectedIds.length > 0 && vectorEditingNodeIds.length === 0) {
    const nodesToDuplicate = selectOrderedNodes(state).filter((node) => selectedIds.includes(node.id));

    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    nodesToDuplicate.forEach((node) => dispatch(addNode(cloneNodeWithOffset(node, DUPLICATE_OFFSET, DUPLICATE_OFFSET))));

    const { rootOrder } = store.getState().design;
    dispatch(setSelection(rootOrder.slice(rootOrder.length - nodesToDuplicate.length)));
    dispatch(endHistoryGesture());
  }
};
