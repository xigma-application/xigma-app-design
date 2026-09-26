// types
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { getEffectiveImageSize } from 'components/Design/Canvas/utils/getEffectiveImageSize';
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
import { getImageFillContainRect } from 'utils/canvas/drawVectorNode/getImageFillContainRect';

export const getImageCropZoomPercent = (node: TImageFrameNode, paint: TImagePaint | TVideoPaint): number => {
  const effectiveSize = getEffectiveImageSize(paint);

  if (effectiveSize && effectiveSize.width > 0) {
    const bounds = { height: node.height, width: node.width, x: node.x, y: node.y };
    const baseRect = getImageFillContainRect(bounds, effectiveSize.width, effectiveSize.height);
    const currentWidth = getImageCropRect(node, paint).width;

    if (effectiveSize.width !== baseRect.width) {
      const percent = ((currentWidth - baseRect.width) / (effectiveSize.width - baseRect.width)) * 100;
      return Math.min(100, Math.max(0, Math.round(percent)));
    }
  }

  return 0;
};
