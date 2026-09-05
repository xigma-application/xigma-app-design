// types
import { TPoint } from 'types/canvas';
import { TVectorSegment } from 'types/design/types';

export const translateVectorHandles = (
  segments: Record<string, TVectorSegment>,
  handleOrigins: Record<string, TPoint>,
  deltaX: number,
  deltaY: number,
): Record<string, TVectorSegment> =>
  Object.entries(handleOrigins).reduce((nextSegments, [key, origin]) => {
    const [end, segmentId] = key.split(':') as ['end' | 'start', string];
    const segment = nextSegments[segmentId];
    const field = end === 'start' ? 'tangentStart' : 'tangentEnd';

    return {
      ...nextSegments,
      [segmentId]: { ...segment, [field]: { x: Math.round(origin.x + deltaX), y: Math.round(origin.y + deltaY) } },
    };
  }, segments);
