import { RefObject } from 'react';

// store
import { setPenActiveVertexId, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorTangent } from 'types/design/types';

// utils
import { splitVectorSegment } from '../splitVectorSegment';

export const closeLoopOntoEdge = (
  point: TPoint,
  node: TVectorNode,
  activeVertexId: string,
  edgeSegmentId: string,
  t: number,
  connectingSegmentId: string,
  tangentStart: TVectorTangent,
  dispatch: AppDispatch,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
): void => {
  const { fillByKey, filledFaceKeys, newVertexId, segments: splitSegments, vertices } = splitVectorSegment(node, edgeSegmentId, t);
  const connectingSegment: TVectorSegment = {
    endId: newVertexId,
    id: connectingSegmentId,
    startId: activeVertexId,
    tangentEnd: null,
    tangentStart,
  };
  const segments = { ...splitSegments, [connectingSegmentId]: connectingSegment };

  dispatch(updateNode({ changes: { fillByKey, filledFaceKeys, segments, vertices }, id: node.id }));
  dispatch(setPenActiveVertexId(null));

  dragOriginRef.current = { nodeId: node.id, segmentId: connectingSegmentId, vertexId: newVertexId };
  dragStartRef.current = point;
  pendingOutgoingTangentRef.current = null;
};
