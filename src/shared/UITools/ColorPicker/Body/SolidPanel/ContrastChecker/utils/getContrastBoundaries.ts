// others
import { getIsoContrastCurve } from './getIsoContrastCurve';

// types
import { TContrastBoundary } from '../types';

export const getContrastBoundaries = (hue: number, backgroundLuminance: number, targetRatio: number): TContrastBoundary[] => {
  const lighterBound = targetRatio * (backgroundLuminance + 0.05) - 0.05;
  const darkerBound = (backgroundLuminance + 0.05) / targetRatio - 0.05;
  const boundaries: TContrastBoundary[] = [];

  if (lighterBound >= 0 && lighterBound <= 1) {
    const points = getIsoContrastCurve(hue, lighterBound);

    if (points.length > 0) {
      boundaries.push({ passSide: 'lighter', points });
    }
  }

  if (darkerBound >= 0 && darkerBound <= 1) {
    const points = getIsoContrastCurve(hue, darkerBound);

    if (points.length > 0) {
      boundaries.push({ passSide: 'darker', points });
    }
  }

  return boundaries;
};
