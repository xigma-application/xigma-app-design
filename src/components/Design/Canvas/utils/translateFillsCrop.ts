// types
import { TPaint } from 'types/design/paint/types';

export const translateFillsCrop = (
  fills: TPaint[] | undefined,
  deltaX: number,
  deltaY: number,
  skipPaintIndex: number | null = null,
): TPaint[] | undefined => {
  const hasCrop =
    Array.isArray(fills) &&
    fills.some((fill, index) => (fill.type === 'image' || fill.type === 'video') && fill.crop && index !== skipPaintIndex);

  if (hasCrop && fills) {
    return fills.map((fill, index) => {
      if ((fill.type === 'image' || fill.type === 'video') && fill.crop && index !== skipPaintIndex) {
        return { ...fill, crop: { ...fill.crop, x: fill.crop.x + deltaX, y: fill.crop.y + deltaY } };
      }

      return fill;
    });
  }

  return undefined;
};
