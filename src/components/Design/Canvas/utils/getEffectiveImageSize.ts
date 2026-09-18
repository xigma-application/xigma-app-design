// types
import { TImagePaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

export const getEffectiveImageSize = (paint: TImagePaint | TVideoPaint): { height: number; width: number } | undefined => {
  const imageSize = imagePaintTextureSizeCache.get(paint.ref);

  if (imageSize) {
    const isSideways = paint.rotation === 90 || paint.rotation === 270;

    return {
      height: isSideways ? imageSize.width : imageSize.height,
      width: isSideways ? imageSize.height : imageSize.width,
    };
  }

  return undefined;
};
