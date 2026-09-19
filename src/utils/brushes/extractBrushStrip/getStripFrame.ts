// types
import { TBrushCenterline } from '../getBrushCenterline/types';
import { TStripFrame } from './types';

export const getStripFrame = (centerline: TBrushCenterline, arc: number[], step: number): TStripFrame => {
  const { points, tangents } = centerline;
  let index = 0;

  while (index < arc.length - 2 && arc[index + 1] < step) {
    index += 1;
  }

  const span = arc[index + 1] - arc[index] || 1;
  const t = Math.min(1, Math.max(0, (step - arc[index]) / span));
  const tangent = {
    x: tangents[index].x + (tangents[index + 1].x - tangents[index].x) * t,
    y: tangents[index].y + (tangents[index + 1].y - tangents[index].y) * t,
  };
  const norm = Math.hypot(tangent.x, tangent.y) || 1;

  return {
    normal: { x: -tangent.y / norm, y: tangent.x / norm },
    x: points[index].x + (points[index + 1].x - points[index].x) * t,
    y: points[index].y + (points[index + 1].y - points[index].y) * t,
  };
};
