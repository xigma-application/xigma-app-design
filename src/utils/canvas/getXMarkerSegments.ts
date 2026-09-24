// types
import { TLineSegment, TPoint } from 'types/canvas';

export const getXMarkerSegments = (center: TPoint, halfSize: number): TLineSegment[] => [
  { x1: center.x - halfSize, x2: center.x + halfSize, y1: center.y - halfSize, y2: center.y + halfSize },
  { x1: center.x - halfSize, x2: center.x + halfSize, y1: center.y + halfSize, y2: center.y - halfSize },
];
