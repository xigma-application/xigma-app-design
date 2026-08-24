// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { deleteNode } from 'store/design/slice';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectSelectedIds, selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { deleteSelectedSegments } from './deleteSelectedSegments';
import { deleteSelectedVertices } from './deleteSelectedVertices';
import { getOwningSegmentNodes } from './getOwningSegmentNodes';
import { getOwningVertexNodes } from './getOwningVertexNodes';

export const handleDeleteSelection = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const { selectedVectorHandlesRef, selectedVectorSegmentIdsRef, selectedVectorVertexIdsRef } = refs;
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const selectedVertexIds = selectedVectorVertexIdsRef.current;
  const selectedSegmentIds = selectedVectorSegmentIdsRef.current;

  if (selectedVertexIds.length > 0) {
    const owningNodes = getOwningVertexNodes(vectorEditingNodeIds, state.design.nodes, selectedVertexIds);

    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    deleteSelectedVertices(dispatch, owningNodes, selectedVertexIds);
    dispatch(endHistoryGesture());
    selectedVectorVertexIdsRef.current = [];
  } else if (selectedSegmentIds.length > 0) {
    const owningNodes = getOwningSegmentNodes(vectorEditingNodeIds, state.design.nodes, selectedSegmentIds);

    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    deleteSelectedSegments(dispatch, owningNodes, selectedSegmentIds);
    dispatch(endHistoryGesture());
    selectedVectorSegmentIdsRef.current = [];
  } else if (selectedVectorHandlesRef.current.length === 0) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    selectSelectedIds(state).forEach((id) => dispatch(deleteNode(id)));
    dispatch(endHistoryGesture());
  }
};
