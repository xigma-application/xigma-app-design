import { RefObject } from 'react';

// store
import { endHistoryGesture } from 'store/history/actions';
import { setPenActiveVertexId, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPendingOutgoingTangent } from '../../../types';
import { TVectorNode, TVectorSegment, TVectorTangent } from 'types/design/types';

export const closeLoopOntoVertex = (
  node: TVectorNode,
  activeVertexId: string,
  targetVertexId: string,
  segmentId: string,
  tangentStart: TVectorTangent,
  dispatch: AppDispatch,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
): void => {
  const newSegment: TVectorSegment = { endId: targetVertexId, id: segmentId, startId: activeVertexId, tangentEnd: null, tangentStart };
  const segments = { ...node.segments, [segmentId]: newSegment };

  dispatch(updateNode({ changes: { segments }, id: node.id }));
  dispatch(setPenActiveVertexId(null));
  dispatch(endHistoryGesture());

  pendingOutgoingTangentRef.current = null;
};
