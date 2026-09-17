// types
import { TDraftRect } from 'types/canvas';

export const getImageFillCoverRect = (bounds: TDraftRect, imageWidth: number, imageHeight: number): TDraftRect => {
  if (bounds.width > 0 && bounds.height > 0 && imageWidth > 0 && imageHeight > 0) {
    const boundsAspect = bounds.width / bounds.height;
    const imageAspect = imageWidth / imageHeight;
    const width = imageAspect > boundsAspect ? bounds.height * imageAspect : bounds.width;
    const height = imageAspect > boundsAspect ? bounds.height : bounds.width / imageAspect;

    return { height, width, x: bounds.x + (bounds.width - width) / 2, y: bounds.y + (bounds.height - height) / 2 };
  }

  return bounds;
};
