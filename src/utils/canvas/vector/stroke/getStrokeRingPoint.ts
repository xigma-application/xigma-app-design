// types
import { TPoint } from 'types/canvas';
import { TStrokeRing } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/types';

// utils
import { sampleStrokeRing } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/sampleStrokeRing';

export const getStrokeRingPoint = (ring: TStrokeRing, distance: number, ratio: number): TPoint => {
  const clamped = Math.min(Math.max(distance, 0), ring.perimeter);
  const { mid, vec } = sampleStrokeRing(ring, clamped);
  const length = Math.hypot(vec.x, vec.y) || 1;
  const overshoot = distance - clamped;

  return {
    x: mid.x + vec.x * ratio + (vec.y / length) * overshoot,
    y: mid.y + vec.y * ratio - (vec.x / length) * overshoot,
  };
};
