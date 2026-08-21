// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { flattenSegment } from '../flattenSegment';
import { splitCubicBezier } from '../splitCubicBezier';

export const getSubArcPoints = (
  segment: TVectorSegment,
  vertices: Record<string, TVectorVertex>,
  tLow: number,
  tHigh: number,
  sampleCount: number,
): TPoint[] => {
  const start = vertices[segment.startId];
  const end = vertices[segment.endId];
  const upToHigh = splitCubicBezier(start, end, segment.tangentStart, segment.tangentEnd, tHigh);
  const trimmed = splitCubicBezier(start, upToHigh.point, upToHigh.firstTangentStart, upToHigh.firstTangentEnd, tLow / tHigh);

  return flattenSegment(trimmed.point, upToHigh.point, trimmed.secondTangentStart, trimmed.secondTangentEnd, sampleCount);
};
