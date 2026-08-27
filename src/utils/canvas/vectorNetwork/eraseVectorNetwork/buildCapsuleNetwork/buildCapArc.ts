// types
import { TPoint } from 'types/canvas';

const CAP_SEGMENTS = 8;

const PHASE_OFFSET = 0.0137;

export const buildCapArc = (center: TPoint, directionAngle: number, sweepSign: 1 | -1, radius: number): TPoint[] => {
  const startAngle = directionAngle - Math.PI / 2 + PHASE_OFFSET;

  return Array.from({ length: CAP_SEGMENTS + 1 }, (_, index) => {
    const angle = startAngle + (sweepSign * Math.PI * index) / CAP_SEGMENTS;

    return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
  });
};
