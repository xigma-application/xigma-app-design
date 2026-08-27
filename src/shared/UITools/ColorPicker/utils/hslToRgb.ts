// types
import { TRgb } from 'types/color';
import { THsl } from '../types';

// utils
import { getRgbPrimeChannels } from './getRgbPrimeChannels';

export const hslToRgb = ({ h, l, s }: THsl): TRgb => {
  const saturation = s / 100;
  const lightness = l / 100;
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lightness - c / 2;
  const { bPrime, gPrime, rPrime } = getRgbPrimeChannels(h, c, x);

  return {
    b: Math.round((bPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    r: Math.round((rPrime + m) * 255),
  };
};
