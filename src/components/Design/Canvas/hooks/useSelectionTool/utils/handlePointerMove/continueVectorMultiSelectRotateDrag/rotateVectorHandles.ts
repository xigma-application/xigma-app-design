// types
import { TPoint } from 'types/canvas';
import { TVectorSegment } from 'types/design/types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

export const rotateVectorHandles = (
  segments: Record<string, TVectorSegment>,
  handleOrigins: Record<string, TPoint>,
  deltaDegrees: number,
): Record<string, TVectorSegment> =>
  Object.entries(handleOrigins).reduce((nextSegments, [key, origin]) => {
    const [end, segmentId] = key.split(':') as ['end' | 'start', string];
    const segment = nextSegments[segmentId];
    const field = end === 'start' ? 'tangentStart' : 'tangentEnd';
    const rotated = rotatePoint(origin, ORIGIN, deltaDegrees);

    return { ...nextSegments, [segmentId]: { ...segment, [field]: { x: Math.round(rotated.x), y: Math.round(rotated.y) } } };
  }, segments);
