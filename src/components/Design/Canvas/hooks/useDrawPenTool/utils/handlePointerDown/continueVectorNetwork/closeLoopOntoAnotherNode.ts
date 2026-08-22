import { RefObject } from 'react';

// store
import { deleteNode, setPenActiveVertexId, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorTangent } from 'types/design/types';

export const closeLoopOntoAnotherNode = (
  point: TPoint,
  sourceNode: TVectorNode,
  targetNode: TVectorNode,
  activeVertexId: string,
  targetVertexId: string,
  segmentId: string,
  tangentStart: TVectorTangent,
  vectorEditingNodeIds: string[],
  dispatch: AppDispatch,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
): void => {
  const newSegment: TVectorSegment = { endId: targetVertexId, id: segmentId, startId: activeVertexId, tangentEnd: null, tangentStart };
  const vertices = { ...sourceNode.vertices, ...targetNode.vertices };
  const segments = { ...sourceNode.segments, ...targetNode.segments, [segmentId]: newSegment };
  const vertexHandleModes = { ...sourceNode.vertexHandleModes, ...targetNode.vertexHandleModes };
  const filledFaceKeys = Array.from(new Set([...sourceNode.filledFaceKeys, ...targetNode.filledFaceKeys]));

  dispatch(updateNode({ changes: { filledFaceKeys, segments, vertexHandleModes, vertices }, id: sourceNode.id }));
  dispatch(deleteNode(targetNode.id));
  dispatch(setVectorEditingNodeIds(vectorEditingNodeIds.filter((id) => id !== targetNode.id)));
  dispatch(setPenActiveVertexId(null));

  dragOriginRef.current = { nodeId: sourceNode.id, segmentId, vertexId: targetVertexId };
  dragStartRef.current = point;
  pendingOutgoingTangentRef.current = null;
};
