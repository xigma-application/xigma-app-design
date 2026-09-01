import { nanoid } from '@reduxjs/toolkit';

// types
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { remapFilledFaceKeysAfterSegmentSplit } from 'utils/canvas/vectorNetwork/remapFilledFaceKeysAfterSegmentSplit';
import { roundVectorPoint } from 'utils/canvas/vectorNetwork/roundVectorPoint';
import { splitCubicBezier } from 'utils/canvas/vectorNetwork/splitCubicBezier';

export const splitVectorSegment = (
  node: TVectorNode,
  segmentId: string,
  t: number,
): {
  fillColorOverrideByKey: Record<string, string>;
  filledFaceKeys: string[];
  newVertexId: string;
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TVectorVertex>;
} => {
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
  const { fillColorOverrideByKey, filledFaceKeys } = remapFilledFaceKeysAfterSegmentSplit(node.filledFaceKeys, node.fillColorOverrideByKey, {
    newSegmentId,
    newVertexId,
    originalEndId: segment.endId,
    originalSegmentId: segmentId,
    originalStartId: segment.startId,
  });

  return { fillColorOverrideByKey, filledFaceKeys, newVertexId, segments, vertices };
};
