// types
import { StrokeBrushDirection } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TStrokeRing } from '../types';
import { TScatterBrushOptions, TScatterDot } from './types';

// utils
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { getDotChunkPaths } from './getDotChunkPaths';
import { getScatterLayout } from './getScatterLayout';
import { getScatterPreset } from './getScatterPreset';
import { getStampAngle } from './getStampAngle';
import { getStampCenter } from './getStampCenter';
import { getStampDots } from './getStampDots';
import { getStampSize } from './getStampSize';
import { getStrokeProfileWidthMultiplier } from 'utils/design/stroke/getStrokeProfileWidthMultiplier';
import { sampleStrokeRing } from '../sampleStrokeRing';

export const getBoxScatterBrushPolygons = (
  ring: TStrokeRing,
  { angularJitter, direction, flipped, gap, index, profile, rotation, seed, sizeJitter, stats, strokeWidth, wiggle }: TScatterBrushOptions,
): TPoint[][] | null => {
  if (ring.perimeter > 0 && strokeWidth > 0 && gap > 0) {
    const preset = getScatterPreset(index, stats);
    const random = createSeededRandom(seed);
    const { dotsPerStamp, pitch, stampCount } = getScatterLayout(ring.perimeter, gap, strokeWidth, preset.dots);
    const dots: TScatterDot[] = [];

    for (let stamp = 0; stamp < stampCount; stamp += 1) {
      const travel = stamp * pitch;
      const sample = sampleStrokeRing(ring, direction === StrokeBrushDirection.right ? travel : ring.perimeter - travel);
      const size = getStampSize(
        strokeWidth,
        sizeJitter,
        getStrokeProfileWidthMultiplier(profile, travel / ring.perimeter, flipped),
        random,
      );
      const center = getStampCenter(sample, wiggle, size, random);
      const angle = getStampAngle(sample.tangent, rotation, angularJitter, random);

      dots.push(...getStampDots(center, angle, size, preset, dotsPerStamp, random));
    }

    return getDotChunkPaths(dots);
  }

  return null;
};
