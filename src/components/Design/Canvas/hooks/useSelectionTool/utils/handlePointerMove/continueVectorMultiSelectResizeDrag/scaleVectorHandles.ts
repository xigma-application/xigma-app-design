// types
import { TPoint } from 'types/canvas';
import { TVectorSegment } from 'types/design/types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

export const scaleVectorHandles = (
  segments: Record<string, TVectorSegment>,
  handleOrigins: Record<string, TPoint>,
  rotation: number,
  scaleX: number,
  scaleY: number,
): Record<string, TVectorSegment> =>
  Object.entries(handleOrigins).reduce((nextSegments, [key, origin]) => {
    const [end, segmentId] = key.split(':') as ['end' | 'start', string];
    const segment = nextSegments[segmentId];
    const field = end === 'start' ? 'tangentStart' : 'tangentEnd';
    const local = rotatePoint(origin, ORIGIN, -rotation);
    const scaledLocal = { x: local.x * scaleX, y: local.y * scaleY };
    const world = rotatePoint(scaledLocal, ORIGIN, rotation);

    return { ...nextSegments, [segmentId]: { ...segment, [field]: { x: Math.round(world.x), y: Math.round(world.y) } } };
  }, segments);
