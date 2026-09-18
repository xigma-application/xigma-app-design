// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TAspectRatioTarget } from '../types';
import { TDraftRect } from 'types/canvas';
import { TImagePaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { getEffectiveImageSize } from 'components/Design/Canvas/utils/getEffectiveImageSize';
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
import { getImageFillContainRect } from 'utils/canvas/drawVectorNode/getImageFillContainRect';

export const getAspectRatioPresetRect = (node: TAppearanceNode, paint: TImagePaint | TVideoPaint, target: TAspectRatioTarget): TDraftRect | undefined => {
  const cropRect = getImageCropRect(node, paint);

  if (target === 'original') {
    const effectiveSize = getEffectiveImageSize(paint);

    if (effectiveSize) {
      const centerX = cropRect.x + cropRect.width / 2;
      const centerY = cropRect.y + cropRect.height / 2;

      return {
        height: effectiveSize.height,
        width: effectiveSize.width,
        x: centerX - effectiveSize.width / 2,
        y: centerY - effectiveSize.height / 2,
      };
    }

    return undefined;
  }

  return getImageFillContainRect(cropRect, target.ratioWidth, target.ratioHeight);
};
