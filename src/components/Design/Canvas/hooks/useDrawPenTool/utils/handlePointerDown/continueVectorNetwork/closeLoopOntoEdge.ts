import { RefObject } from 'react';

// store
import { endHistoryGesture } from 'store/history/actions';
import { setPenActiveVertexId, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPendingOutgoingTangent } from '../../../types';
import { TVectorNode, TVectorSegment, TVectorTangent } from 'types/design/types';

// utils
import { splitVectorSegment } from '../splitVectorSegment';

export const closeLoopOntoEdge = (
  node: TVectorNode,
  activeVertexId: string,
  edgeSegmentId: string,
  t: number,
  connectingSegmentId: string,
  tangentStart: TVectorTangent,
  dispatch: AppDispatch,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
): void => {
  const { newVertexId, segments: splitSegments, vertices } = splitVectorSegment(node, edgeSegmentId, t);
  const connectingSegment: TVectorSegment = {
    endId: newVertexId,
    id: connectingSegmentId,
    startId: activeVertexId,
    tangentEnd: null,
    tangentStart,
  };
  const segments = { ...splitSegments, [connectingSegmentId]: connectingSegment };

  dispatch(updateNode({ changes: { segments, vertices }, id: node.id }));
  dispatch(setPenActiveVertexId(null));
  dispatch(endHistoryGesture());

  pendingOutgoingTangentRef.current = null;
};
