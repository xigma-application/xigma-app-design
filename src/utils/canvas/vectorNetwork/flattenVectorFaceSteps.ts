// types
import { TPoint } from 'types/canvas';
import { TVectorFaceStep } from './walkVectorFace';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { flattenSegment } from './flattenSegment';
import { getVectorCurveSegmentCount } from './getVectorCurveSegmentCount';

export const flattenVectorFaceSteps = (
  steps: TVectorFaceStep[],
  segments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
): TPoint[] =>
  steps.flatMap(({ fromId, segmentId, toId }) => {
    const segment = segments[segmentId];
    const forward = segment.startId === fromId;
    const tangentAtFrom = forward ? segment.tangentStart : segment.tangentEnd;
    const tangentAtTo = forward ? segment.tangentEnd : segment.tangentStart;
    const from = vertices[fromId];
    const to = vertices[toId];
    const points = flattenSegment(from, to, tangentAtFrom, tangentAtTo, getVectorCurveSegmentCount(from, to, tangentAtFrom, tangentAtTo));

    return points.slice(0, -1);
  });
