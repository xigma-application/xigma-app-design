// types
import { TRgb } from 'types/color';
import { THsv } from '../types';

// utils
import { getRgbPrimeChannels } from './getRgbPrimeChannels';

export const hsvToRgb = ({ h, s, v }: THsv): TRgb => {
  const saturation = s / 100;
  const value = v / 100;

  const c = value * saturation;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = value - c;

  const { bPrime, gPrime, rPrime } = getRgbPrimeChannels(h, c, x);

  return {
    b: Math.round((bPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    r: Math.round((rPrime + m) * 255),
  };
};
