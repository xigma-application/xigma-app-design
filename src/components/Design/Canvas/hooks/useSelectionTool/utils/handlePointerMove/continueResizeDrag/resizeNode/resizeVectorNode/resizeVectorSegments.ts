// types
import { TVectorSegment } from 'types/design/types';

// utils
import { scaleTangent } from './scaleTangent';

export const resizeVectorSegments = (
  segments: Record<string, TVectorSegment>,
  scaleX: number,
  scaleY: number,
): Record<string, TVectorSegment> =>
  Object.fromEntries(
    Object.entries(segments).map(([segmentId, segment]) => [
      segmentId,
      {
        ...segment,
        tangentEnd: scaleTangent(segment.tangentEnd, scaleX, scaleY),
        tangentStart: scaleTangent(segment.tangentStart, scaleX, scaleY),
      },
    ]),
  );
