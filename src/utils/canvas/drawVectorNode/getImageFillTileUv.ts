// types
import { TImageFillCoverUv } from './getImageFillCoverUv';

export const getImageFillTileUv = (
  boundsWidth: number,
  boundsHeight: number,
  imageWidth: number,
  imageHeight: number,
  scale: number,
): TImageFillCoverUv => {
  if (boundsWidth > 0 && boundsHeight > 0 && imageWidth > 0 && imageHeight > 0 && scale > 0) {
    const tileWidth = imageWidth * scale;
    const tileHeight = imageHeight * scale;

    return { uMax: boundsWidth / tileWidth, uMin: 0, vMax: boundsHeight / tileHeight, vMin: 0 };
  }

  return { uMax: 1, uMin: 0, vMax: 1, vMin: 0 };
};
