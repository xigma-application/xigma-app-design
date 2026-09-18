// others
import { findVForLuminance } from './findVForLuminance';

// types
import { THsv } from '../../../../types';

export const getNearestPassingHsv = (hsv: THsv, backgroundLuminance: number, targetRatio: number): THsv | null => {
  const lighterBound = targetRatio * (backgroundLuminance + 0.05) - 0.05;
  const darkerBound = (backgroundLuminance + 0.05) / targetRatio - 0.05;
  const candidateVs: number[] = [];

  if (lighterBound >= 0 && lighterBound <= 1) {
    const v = findVForLuminance(hsv.h, hsv.s, lighterBound);

    if (v !== null) {
      candidateVs.push(v);
    }
  }

  if (darkerBound >= 0 && darkerBound <= 1) {
    const v = findVForLuminance(hsv.h, hsv.s, darkerBound);

    if (v !== null) {
      candidateVs.push(v);
    }
  }

  if (candidateVs.length !== 0) {
    const nearestV = candidateVs.reduce((closest, candidate) =>
      Math.abs(candidate - hsv.v) < Math.abs(closest - hsv.v) ? candidate : closest,
    );

    return { ...hsv, v: nearestV };
  }

  return null;
};
