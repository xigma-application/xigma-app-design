// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TDraftRect } from 'types/canvas';
import { TImageCrop, TImagePaint } from 'types/design/paint/types';

// utils
import { getEffectiveImageSize } from './getEffectiveImageSize';
import { getImageFillContainRect } from 'utils/canvas/drawVectorNode/getImageFillContainRect';
import { getImageFillCoverRect } from 'utils/canvas/drawVectorNode/getImageFillCoverRect';

const seedFromNaturalSize = (bounds: TDraftRect, node: TAppearanceNode, paint: TImagePaint): TImageCrop | undefined => {
  const effectiveSize = getEffectiveImageSize(paint);

  if (effectiveSize) {
    const rect =
      paint.scaleMode === 'fit'
        ? getImageFillContainRect(bounds, effectiveSize.width, effectiveSize.height)
        : getImageFillCoverRect(bounds, effectiveSize.width, effectiveSize.height);

    return { height: rect.height, rotation: node.rotation, width: rect.width, x: rect.x, y: rect.y };
  }

  return undefined;
};

export const getImageCropRect = (node: TAppearanceNode, paint: TImagePaint): TImageCrop => {
  if (!paint.crop) {
    const bounds = { height: node.height, width: node.width, x: node.x, y: node.y };

    if (paint.scaleMode === 'fit' || paint.scaleMode === 'fill') {
      const seeded = seedFromNaturalSize(bounds, node, paint);

      if (seeded) {
        return seeded;
      }
    }

    return { ...bounds, rotation: node.rotation };
  }

  return paint.crop;
};
