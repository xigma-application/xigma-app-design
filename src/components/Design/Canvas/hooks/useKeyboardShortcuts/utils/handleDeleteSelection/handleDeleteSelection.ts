// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { deleteNode } from 'store/design/slice';
import { selectSelectedIds, selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { deleteSelectedSegments } from './deleteSelectedSegments';
import { deleteSelectedVertices } from './deleteSelectedVertices';
import { dispatchAsOneGestureIfMultiNode } from './dispatchAsOneGestureIfMultiNode';
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

    dispatchAsOneGestureIfMultiNode(dispatch, owningNodes.length, () => deleteSelectedVertices(dispatch, owningNodes, selectedVertexIds));
    selectedVectorVertexIdsRef.current = [];
  } else if (selectedSegmentIds.length > 0) {
    const owningNodes = getOwningSegmentNodes(vectorEditingNodeIds, state.design.nodes, selectedSegmentIds);

    dispatchAsOneGestureIfMultiNode(dispatch, owningNodes.length, () => deleteSelectedSegments(dispatch, owningNodes, selectedSegmentIds));
    selectedVectorSegmentIdsRef.current = [];
  } else if (selectedVectorHandlesRef.current.length === 0) {
    dispatch(beginHistoryGesture());
    selectSelectedIds(state).forEach((id) => dispatch(deleteNode(id)));
    dispatch(endHistoryGesture());
  }
};
