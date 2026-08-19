import { nanoid } from '@reduxjs/toolkit';
import { RefObject } from 'react';

// store
import { setPenActiveVertexId, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorTangent } from 'types/design/types';

export const extendWithNewVertex = (
  point: TPoint,
  node: TVectorNode,
  activeVertexId: string,
  segmentId: string,
  tangentStart: TVectorTangent,
  dispatch: AppDispatch,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
): void => {
  const vertexId = nanoid();
  const newSegment: TVectorSegment = { endId: vertexId, id: segmentId, startId: activeVertexId, tangentEnd: null, tangentStart };
  const segments = { ...node.segments, [segmentId]: newSegment };
  const vertices = { ...node.vertices, [vertexId]: { id: vertexId, x: point.x, y: point.y } };

  dispatch(updateNode({ changes: { segments, vertices }, id: node.id }));
  dispatch(setPenActiveVertexId(vertexId));

  pendingOutgoingTangentRef.current = null;
  dragOriginRef.current = { nodeId: node.id, segmentId, vertexId };
  dragStartRef.current = point;
};
