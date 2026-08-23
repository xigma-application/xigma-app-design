// others
import { nanoid } from '@reduxjs/toolkit';

// types
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { roundVectorPoint } from '../roundVectorPoint';
import { splitCubicBezier } from '../splitCubicBezier';

const SEVER_ENDPOINT_EPS = 0.001;

export const severVectorSegmentAtPoint = (
  node: TVectorNode,
  segmentId: string,
  t: number,
): { segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> } => {
  const segment = node.segments[segmentId];

  if (t <= SEVER_ENDPOINT_EPS || t >= 1 - SEVER_ENDPOINT_EPS) {
    const boundaryVertexId = t <= SEVER_ENDPOINT_EPS ? segment.startId : segment.endId;
    const boundaryPoint = node.vertices[boundaryVertexId];
    const newVertexId = nanoid();
    const severedSegment: TVectorSegment =
      t <= SEVER_ENDPOINT_EPS ? { ...segment, startId: newVertexId } : { ...segment, endId: newVertexId };

    return {
      segments: { ...node.segments, [segmentId]: severedSegment },
      vertices: { ...node.vertices, [newVertexId]: { id: newVertexId, x: boundaryPoint.x, y: boundaryPoint.y } },
    };
  }

  const start = node.vertices[segment.startId];
  const end = node.vertices[segment.endId];
  const split = splitCubicBezier(start, end, segment.tangentStart, segment.tangentEnd, t);
  const vertexBeforeId = nanoid();
  const vertexAfterId = nanoid();
  const afterSegmentId = nanoid();
  const splitPoint = roundVectorPoint(split.point);

  return {
    segments: {
      ...node.segments,
      [afterSegmentId]: {
        endId: segment.endId,
        id: afterSegmentId,
        startId: vertexAfterId,
        tangentEnd: split.secondTangentEnd,
        tangentStart: split.secondTangentStart,
      },
      [segmentId]: {
        endId: vertexBeforeId,
        id: segmentId,
        startId: segment.startId,
        tangentEnd: split.firstTangentEnd,
        tangentStart: split.firstTangentStart,
      },
    },
    vertices: {
      ...node.vertices,
      [vertexAfterId]: { id: vertexAfterId, ...splitPoint },
      [vertexBeforeId]: { id: vertexBeforeId, ...splitPoint },
    },
  };
};
