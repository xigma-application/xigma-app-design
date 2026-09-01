import { CSSProperties } from 'react';

// types
import { TScrollThumbOrientation } from '../types';

export const getThumbStyle = (orientation: TScrollThumbOrientation, sizeRatio: number, startRatio: number): CSSProperties => {
  const sizePercent = `${sizeRatio * 100}%`;
  const startPercent = `${startRatio * (100 - sizeRatio * 100)}%`;

  if (orientation === 'horizontal') {
    return { left: startPercent, width: sizePercent };
  }

  return { height: sizePercent, top: startPercent };
};
