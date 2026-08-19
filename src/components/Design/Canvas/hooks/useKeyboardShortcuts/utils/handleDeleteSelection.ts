// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { deleteNode, updateNode } from 'store/design/slice';
import { selectSelectedIds, selectVectorEditingNodeId } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorEditingNode } from '../../../utils/getVectorEditingNode';

const getRemainingSegments = (node: TVectorNode, selectedVertexIds: string[]): Record<string, TVectorSegment> =>
  Object.fromEntries(
    Object.entries(node.segments).filter(
      ([, segment]) => !selectedVertexIds.includes(segment.startId) && !selectedVertexIds.includes(segment.endId),
    ),
  );

export const handleDeleteSelection = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const { selectedVectorHandleRef, selectedVectorVertexIdsRef } = refs;
  const state = store.getState();
  const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));
  const selectedVertexIds = selectedVectorVertexIdsRef.current;

  if (node && selectedVertexIds.length > 0) {
    const vertices = Object.fromEntries(Object.entries(node.vertices).filter(([id]) => !selectedVertexIds.includes(id)));
    const segments = getRemainingSegments(node, selectedVertexIds);

    dispatch(updateNode({ changes: { segments, vertices }, id: node.id }));
    selectedVectorVertexIdsRef.current = [];
  } else if (!selectedVectorHandleRef.current) {
    dispatch(beginHistoryGesture());
    selectSelectedIds(state).forEach((id) => dispatch(deleteNode(id)));
    dispatch(endHistoryGesture());
  }
};
