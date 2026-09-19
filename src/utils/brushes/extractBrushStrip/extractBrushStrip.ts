// types
import { TBrushAlpha, TBrushStrip } from '../types';

// utils
import { getArcLengths } from './getArcLengths';
import { getBrushCenterline } from '../getBrushCenterline/getBrushCenterline';
import { getStripExtent } from './getStripExtent';
import { getStripFrames } from './getStripFrames';
import { getStripSamples } from './getStripSamples';
import { getStripScale } from './getStripScale';

export const extractBrushStrip = (alpha: TBrushAlpha): TBrushStrip | null => {
  const centerline = getBrushCenterline(alpha);

  if (centerline) {
    const frames = getStripFrames(centerline, getArcLengths(centerline.points));
    const halfWidth = Math.max(1, Math.ceil(getStripExtent(alpha, frames)) + 1);
    const height = halfWidth * 2 + 1;
    const data = getStripSamples(alpha, frames, halfWidth);

    return { data, halfWidth, height, length: frames.length, scale: getStripScale(data, frames.length, height) };
  }

  return null;
};
