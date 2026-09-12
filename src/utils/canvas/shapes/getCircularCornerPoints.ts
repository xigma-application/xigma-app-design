// types
import { TPoint } from 'types/canvas';

export const getCircularCornerPoints = (centerX: number, centerY: number, radius: number, startAngle: number, segments: number): TPoint[] =>
  Array.from({ length: segments + 1 }, (_, index) => {
    const angle = startAngle + (index / segments) * (Math.PI / 2);
    return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
  });
