import { nanoid } from '@reduxjs/toolkit';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

export const splitVectorSegment = (
  node: TVectorNode,
  segmentId: string,
  point: TPoint,
): { newVertexId: string; segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> } => {
  const segment = node.segments[segmentId];
  const newVertexId = nanoid();
  const newSegmentId = nanoid();

  const segments = {
    ...node.segments,
    [newSegmentId]: { endId: segment.endId, id: newSegmentId, startId: newVertexId, tangentEnd: segment.tangentEnd, tangentStart: null },
    [segmentId]: { endId: newVertexId, id: segmentId, startId: segment.startId, tangentEnd: null, tangentStart: segment.tangentStart },
  };
  const vertices = { ...node.vertices, [newVertexId]: { id: newVertexId, x: Math.round(point.x), y: Math.round(point.y) } };

  return { newVertexId, segments, vertices };
};
