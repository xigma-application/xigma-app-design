import { RefObject } from 'react';

// store
import { setPenActiveVertexId, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorTangent } from 'types/design/types';

const isAlreadyConnected = (node: TVectorNode, activeVertexId: string, targetVertexId: string): boolean =>
  Object.values(node.segments).some(
    (segment) =>
      (segment.startId === activeVertexId && segment.endId === targetVertexId) ||
      (segment.startId === targetVertexId && segment.endId === activeVertexId),
  );

export const closeLoopOntoVertex = (
  point: TPoint,
  node: TVectorNode,
  activeVertexId: string,
  targetVertexId: string,
  segmentId: string,
  tangentStart: TVectorTangent,
  dispatch: AppDispatch,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
): void => {
  if (isAlreadyConnected(node, activeVertexId, targetVertexId)) {
    dispatch(setPenActiveVertexId(null));
  } else {
    const newSegment: TVectorSegment = { endId: targetVertexId, id: segmentId, startId: activeVertexId, tangentEnd: null, tangentStart };
    const segments = { ...node.segments, [segmentId]: newSegment };

    dispatch(updateNode({ changes: { segments }, id: node.id }));
    dispatch(setPenActiveVertexId(null));

    dragOriginRef.current = { nodeId: node.id, segmentId, vertexId: targetVertexId };
    dragStartRef.current = point;
  }

  pendingOutgoingTangentRef.current = null;
};
