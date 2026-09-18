// types
import { TPoint } from 'types/canvas';
import { TPaint } from 'types/design/paint/types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const rotateFillsCrop = (
  fills: TPaint[] | undefined,
  pivot: TPoint,
  deltaDegrees: number,
  skipPaintIndex: number | null = null,
): TPaint[] | undefined => {
  const hasCrop =
    Array.isArray(fills) &&
    fills.some((fill, index) => (fill.type === 'image' || fill.type === 'video') && fill.crop && index !== skipPaintIndex);

  if (hasCrop && fills) {
    return fills.map((fill, index) => {
      if ((fill.type === 'image' || fill.type === 'video') && fill.crop && index !== skipPaintIndex) {
        const { crop } = fill;
        const center = { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 };
        const newCenter = rotatePoint(center, pivot, deltaDegrees);

        return {
          ...fill,
          crop: {
            ...crop,
            rotation: Math.round((crop.rotation + deltaDegrees) * 100) / 100,
            x: newCenter.x - crop.width / 2,
            y: newCenter.y - crop.height / 2,
          },
        };
      }

      return fill;
    });
  }

  return undefined;
};
