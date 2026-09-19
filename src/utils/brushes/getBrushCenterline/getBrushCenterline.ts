// types
import { TBrushAlpha } from '../types';
import { TBrushCenterline } from './types';

// utils
import { fillGaps } from './fillGaps';
import { getCenterlineTangents } from './getCenterlineTangents';
import { getColumnMids } from './getColumnMids';
import { smoothValues } from './smoothValues';

export const getBrushCenterline = (alpha: TBrushAlpha): TBrushCenterline | null => {
  const mids = getColumnMids(alpha);
  const first = mids.findIndex((mid) => mid !== null);
  const last = mids.length - 1 - [...mids].reverse().findIndex((mid) => mid !== null);

  if (first !== -1 && last > first) {
    const points = smoothValues(fillGaps(mids, first, last)).map((y, index) => ({ x: first + index, y }));

    return { points, tangents: getCenterlineTangents(points) };
  }

  return null;
};
