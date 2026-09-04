// others
import { DIMENSIONS_MIN } from '../constants';

const roundToTwoDecimals = (value: number): number => Math.round(value * 100) / 100;

export const getLockedDimensionsChanges = (
  dimension: 'height' | 'width',
  value: number,
  width: number,
  height: number,
  locked: boolean,
): { height: number; width: number } => {
  const clampedValue = Math.max(value, DIMENSIONS_MIN);

  if (!locked || width <= 0 || height <= 0) {
    return dimension === 'width' ? { height, width: clampedValue } : { height: clampedValue, width };
  }

  const ratio = width / height;
  const nextWidth = dimension === 'width' ? clampedValue : roundToTwoDecimals(clampedValue * ratio);
  const nextHeight = dimension === 'width' ? roundToTwoDecimals(clampedValue / ratio) : clampedValue;

  return {
    height: Math.max(nextHeight, DIMENSIONS_MIN),
    width: Math.max(nextWidth, DIMENSIONS_MIN),
  };
};
