// types
import { TPoint } from 'types/canvas';
import { TScatterDot } from './types';

// utils
import { getDotLoop } from './getDotLoop';

export const getChunkPath = (dots: TScatterDot[]): TPoint[] => {
  const loops = dots.map(getDotLoop);
  const returnPath = loops
    .slice(0, -1)
    .map((loop) => loop[0])
    .reverse();

  return [...loops.flat(), ...returnPath];
};
