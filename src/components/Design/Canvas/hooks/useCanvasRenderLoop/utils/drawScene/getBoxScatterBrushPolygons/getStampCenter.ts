// types
import { TPoint } from 'types/canvas';
import { TStrokeRingSample } from '../types';

// others
import { WIGGLE_SIGMA } from './constants';

// utils
import { getGaussian } from './getGaussian';

export const getStampCenter = (sample: TStrokeRingSample, wiggle: number, size: number, random: () => number): TPoint => {
  const sigma = WIGGLE_SIGMA * (wiggle / 100) * size;
  const along = getGaussian(random) * sigma;
  const across = getGaussian(random) * sigma;

  return {
    x: sample.mid.x + sample.tangent.x * along - sample.tangent.y * across,
    y: sample.mid.y + sample.tangent.y * along + sample.tangent.x * across,
  };
};
