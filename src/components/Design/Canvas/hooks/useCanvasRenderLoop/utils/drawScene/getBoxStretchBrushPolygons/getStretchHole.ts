// types
import { TPoint } from 'types/canvas';
import { TStrokeRingSample } from '../types';

// others
import { HOLE_ACROSS_MIN, HOLE_ACROSS_SPAN, HOLE_ALONG_MIN, HOLE_ALONG_SPAN, HOLE_LATERAL, HOLE_POINTS } from './constants';

export const getStretchHole = (sample: TStrokeRingSample, multiplier: number, strokeWidth: number, random: () => number): TPoint[] => {
  const lateral = (random() * 2 - 1) * HOLE_LATERAL * multiplier;
  const radiusAlong = (HOLE_ALONG_MIN + random() * HOLE_ALONG_SPAN) * strokeWidth * multiplier;
  const radiusAcross = (HOLE_ACROSS_MIN + random() * HOLE_ACROSS_SPAN) * strokeWidth * multiplier;
  const center = { x: sample.mid.x + sample.vec.x * lateral, y: sample.mid.y + sample.vec.y * lateral };

  return Array.from({ length: HOLE_POINTS }, (_, point) => {
    const angle = (Math.PI * 2 * point) / HOLE_POINTS;
    const along = Math.cos(angle) * radiusAlong;
    const across = Math.sin(angle) * radiusAcross;

    return {
      x: center.x + sample.tangent.x * along - sample.tangent.y * across,
      y: center.y + sample.tangent.y * along + sample.tangent.x * across,
    };
  });
};
