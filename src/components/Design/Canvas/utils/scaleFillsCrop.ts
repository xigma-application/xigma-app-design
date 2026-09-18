// types
import { TPaint } from 'types/design/paint/types';

export type TScaleFillsCropTransform = {
  newCenterX: number;
  newCenterY: number;
  oldCenterX: number;
  oldCenterY: number;
  scaleX: number;
  scaleY: number;
};

export const scaleFillsCrop = (
  fills: TPaint[] | undefined,
  transform: TScaleFillsCropTransform,
  skipPaintIndex: number | null = null,
): TPaint[] | undefined => {
  const hasCrop = Array.isArray(fills) && fills.some((fill, index) => (fill.type === 'image' || fill.type === 'video') && fill.crop && index !== skipPaintIndex);

  if (hasCrop && fills) {
    const { newCenterX, newCenterY, oldCenterX, oldCenterY, scaleX, scaleY } = transform;

    return fills.map((fill, index) => {
      if ((fill.type === 'image' || fill.type === 'video') && fill.crop && index !== skipPaintIndex) {
        const { crop } = fill;
        const width = crop.width * scaleX;
        const height = crop.height * scaleY;
        const centerX = newCenterX + (crop.x + crop.width / 2 - oldCenterX) * scaleX;
        const centerY = newCenterY + (crop.y + crop.height / 2 - oldCenterY) * scaleY;

        return { ...fill, crop: { ...crop, height, width, x: centerX - width / 2, y: centerY - height / 2 } };
      }

      return fill;
    });
  }

  return undefined;
};
