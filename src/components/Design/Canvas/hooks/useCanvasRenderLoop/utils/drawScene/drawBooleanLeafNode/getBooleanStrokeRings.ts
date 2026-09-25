// types
import { TBooleanShape } from './types';
import { TPoint } from 'types/canvas';

// utils
import { getStrokeOutlinePolygons } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

const cache = new WeakMap<TBooleanShape, Map<number, TPoint[][][]>>();

export const getBooleanStrokeRings = (shape: TBooleanShape, strokeWidth: number): TPoint[][][] => {
  const byWidth = cache.get(shape) ?? new Map<number, TPoint[][][]>();
  const cached = byWidth.get(strokeWidth);

  cache.set(shape, byWidth);

  if (!cached) {
    const rings = shape.polygons.map((loop) => {
      const { inner, outer } = getStrokeOutlinePolygons(loop, strokeWidth / 2, true);
      return [outer, inner];
    });

    byWidth.set(strokeWidth, rings);
    return rings;
  }

  return cached;
};
