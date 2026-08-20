// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { deleteNode, updateNode } from 'store/design/slice';
import { selectSelectedIds, selectVectorEditingNodeId } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorEditingNode } from '../../../utils/getVectorEditingNode';

const getRemainingSegments = (node: TVectorNode, selectedVertexIds: string[]): Record<string, TVectorSegment> =>
  Object.fromEntries(
    Object.entries(node.segments).filter(
      ([, segment]) => !selectedVertexIds.includes(segment.startId) && !selectedVertexIds.includes(segment.endId),
    ),
  );

const getRemainingVertices = (
  vertices: Record<string, TVectorVertex>,
  segments: Record<string, TVectorSegment>,
): Record<string, TVectorVertex> =>
  Object.fromEntries(
    Object.entries(vertices).filter(([id]) => Object.values(segments).some((segment) => segment.startId === id || segment.endId === id)),
  );

export const handleDeleteSelection = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const { selectedVectorHandlesRef, selectedVectorSegmentIdsRef, selectedVectorVertexIdsRef } = refs;
  const state = store.getState();
  const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));
  const selectedVertexIds = selectedVectorVertexIdsRef.current;
  const selectedSegmentIds = selectedVectorSegmentIdsRef.current;

  if (node && selectedVertexIds.length > 0) {
    const vertices = Object.fromEntries(Object.entries(node.vertices).filter(([id]) => !selectedVertexIds.includes(id)));
    const segments = getRemainingSegments(node, selectedVertexIds);

    dispatch(updateNode({ changes: { segments, vertices }, id: node.id }));
    selectedVectorVertexIdsRef.current = [];
  } else if (node && selectedSegmentIds.length > 0) {
    const segments = Object.fromEntries(Object.entries(node.segments).filter(([id]) => !selectedSegmentIds.includes(id)));
    const vertices = getRemainingVertices(node.vertices, segments);

    dispatch(updateNode({ changes: { segments, vertices }, id: node.id }));
    selectedVectorSegmentIdsRef.current = [];
  } else if (selectedVectorHandlesRef.current.length === 0) {
    dispatch(beginHistoryGesture());
    selectSelectedIds(state).forEach((id) => dispatch(deleteNode(id)));
    dispatch(endHistoryGesture());
  }
};
