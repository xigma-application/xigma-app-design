// types
import { TBrushScatterStats } from 'utils/brushes/types';

// others
import { STATS_SIGMA_MAX, STATS_SIGMA_MIN } from './constants';

// utils
import { clamp } from 'utils/math/clamp';
import { getBrushScatterPreset, TBrushScatterPreset } from '../getBrushScatterPreset';

export const getScatterPreset = (index: number, stats: TBrushScatterStats | undefined): TBrushScatterPreset => {
  const base = getBrushScatterPreset(index);
  return stats ? { ...base, sigma: clamp(stats.crossSigma, STATS_SIGMA_MIN, STATS_SIGMA_MAX) } : base;
};
