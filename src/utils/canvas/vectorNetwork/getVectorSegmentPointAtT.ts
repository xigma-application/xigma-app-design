// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { splitCubicBezier } from './splitCubicBezier';

export const getVectorSegmentPointAtT = (node: TVectorNode, segment: TVectorSegment, t: number): TPoint => {
  const start = node.vertices[segment.startId];
  const end = node.vertices[segment.endId];

  return splitCubicBezier(start, end, segment.tangentStart, segment.tangentEnd, t).point;
};
