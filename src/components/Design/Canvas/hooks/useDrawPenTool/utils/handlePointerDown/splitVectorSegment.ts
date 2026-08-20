import { nanoid } from '@reduxjs/toolkit';

// types
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { roundVectorPoint } from 'utils/canvas/vectorNetwork/roundVectorPoint';
import { splitCubicBezier } from 'utils/canvas/vectorNetwork/splitCubicBezier';

export const splitVectorSegment = (
  node: TVectorNode,
  segmentId: string,
  t: number,
): { newVertexId: string; segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> } => {
  const segment = node.segments[segmentId];
  const start = node.vertices[segment.startId];
  const end = node.vertices[segment.endId];
  const split = splitCubicBezier(start, end, segment.tangentStart, segment.tangentEnd, t);
  const newVertexId = nanoid();
  const newSegmentId = nanoid();

  const segments = {
    ...node.segments,
    [newSegmentId]: {
      endId: segment.endId,
      id: newSegmentId,
      startId: newVertexId,
      tangentEnd: split.secondTangentEnd,
      tangentStart: split.secondTangentStart,
    },
    [segmentId]: {
      endId: newVertexId,
      id: segmentId,
      startId: segment.startId,
      tangentEnd: split.firstTangentEnd,
      tangentStart: split.firstTangentStart,
    },
  };
  const vertices = { ...node.vertices, [newVertexId]: { id: newVertexId, ...roundVectorPoint(split.point) } };

  return { newVertexId, segments, vertices };
};
