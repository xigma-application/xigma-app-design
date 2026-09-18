// others
import { findVForLuminance } from './findVForLuminance';

// types
import { TContrastCurvePoint } from '../types';

const SAMPLE_COUNT = 41;

export const getIsoContrastCurve = (hue: number, targetLuminance: number): TContrastCurvePoint[] => {
  const points: TContrastCurvePoint[] = [];

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const saturation = (index / (SAMPLE_COUNT - 1)) * 100;
    const v = findVForLuminance(hue, saturation, targetLuminance);

    if (v !== null) {
      points.push({ s: saturation, v });
    }
  }

  return points;
};
