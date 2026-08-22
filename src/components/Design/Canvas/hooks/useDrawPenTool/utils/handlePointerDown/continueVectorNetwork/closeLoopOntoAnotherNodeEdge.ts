import { RefObject } from 'react';

// store
import { deleteNode, setPenActiveVertexId, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorTangent } from 'types/design/types';

// utils
import { splitVectorSegment } from '../splitVectorSegment';

export const closeLoopOntoAnotherNodeEdge = (
  point: TPoint,
  sourceNode: TVectorNode,
  targetNode: TVectorNode,
  activeVertexId: string,
  targetEdgeSegmentId: string,
  t: number,
  connectingSegmentId: string,
  tangentStart: TVectorTangent,
  vectorEditingNodeIds: string[],
  dispatch: AppDispatch,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
): void => {
  const { newVertexId, segments: targetSegments, vertices: targetVertices } = splitVectorSegment(targetNode, targetEdgeSegmentId, t);
  const connectingSegment: TVectorSegment = {
    endId: newVertexId,
    id: connectingSegmentId,
    startId: activeVertexId,
    tangentEnd: null,
    tangentStart,
  };
  const vertices = { ...sourceNode.vertices, ...targetVertices };
  const segments = { ...sourceNode.segments, ...targetSegments, [connectingSegmentId]: connectingSegment };
  const vertexHandleModes = { ...sourceNode.vertexHandleModes, ...targetNode.vertexHandleModes };
  const filledFaceKeys = Array.from(new Set([...sourceNode.filledFaceKeys, ...targetNode.filledFaceKeys]));

  dispatch(updateNode({ changes: { filledFaceKeys, segments, vertexHandleModes, vertices }, id: sourceNode.id }));
  dispatch(deleteNode(targetNode.id));
  dispatch(setVectorEditingNodeIds(vectorEditingNodeIds.filter((id) => id !== targetNode.id)));
  dispatch(setPenActiveVertexId(null));

  dragOriginRef.current = { nodeId: sourceNode.id, segmentId: connectingSegmentId, vertexId: newVertexId };
  dragStartRef.current = point;
  pendingOutgoingTangentRef.current = null;
};
