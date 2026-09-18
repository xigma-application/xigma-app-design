// others
import { findVForLuminance } from './findVForLuminance';

// types
import { TContrastCurvePoint } from '../types';

const SAMPLE_COUNT = 101;
const MAX_V = 100;

export const getIsoContrastCurve = (hue: number, targetLuminance: number): TContrastCurvePoint[] => {
  const points: TContrastCurvePoint[] = [];

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const saturation = (index / (SAMPLE_COUNT - 1)) * 100;
    const v = findVForLuminance(hue, saturation, targetLuminance);

    points.push({ s: saturation, v: v ?? MAX_V });
  }

  return points;
};
