// types
import { TPoint } from 'types/canvas';

const unitArcCache = new Map<string, TPoint[]>();

const getUnitArc = (startAngle: number, segments: number): TPoint[] => {
  const key = `${startAngle}|${segments}`;
  const cached = unitArcCache.get(key);

  if (cached) {
    return cached;
  }

  const arc = Array.from({ length: segments + 1 }, (_, index) => {
    const angle = startAngle + (index / segments) * (Math.PI / 2);
    return { x: Math.cos(angle), y: Math.sin(angle) };
  });

  unitArcCache.set(key, arc);

  return arc;
};

export const getCircularCornerPoints = (centerX: number, centerY: number, radius: number, startAngle: number, segments: number): TPoint[] =>
  getUnitArc(startAngle, segments).map((unit) => ({ x: centerX + radius * unit.x, y: centerY + radius * unit.y }));
