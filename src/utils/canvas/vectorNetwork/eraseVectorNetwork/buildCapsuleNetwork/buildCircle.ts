// types
import { TPoint } from 'types/canvas';

const CIRCLE_SEGMENTS = 16;
const PHASE_OFFSET = 0.0137;

export const buildCircle = (center: TPoint, radius: number): TPoint[] =>
  Array.from({ length: CIRCLE_SEGMENTS }, (_, index) => {
    const angle = (index / CIRCLE_SEGMENTS) * Math.PI * 2 + PHASE_OFFSET;

    return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
  });
