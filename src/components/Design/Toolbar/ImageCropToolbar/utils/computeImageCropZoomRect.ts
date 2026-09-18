// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImageCrop, TImagePaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { getEffectiveImageSize } from 'components/Design/Canvas/utils/getEffectiveImageSize';
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
import { getImageFillContainRect } from 'utils/canvas/drawVectorNode/getImageFillContainRect';

export const computeImageCropZoomRect = (
  node: TAppearanceNode,
  paint: TImagePaint | TVideoPaint,
  targetPercent: number,
): TImageCrop | undefined => {
  const effectiveSize = getEffectiveImageSize(paint);

  if (effectiveSize) {
    const bounds = { height: node.height, width: node.width, x: node.x, y: node.y };
    const baseRect = getImageFillContainRect(bounds, effectiveSize.width, effectiveSize.height);
    const ratio = Math.min(100, Math.max(0, targetPercent)) / 100;
    const width = baseRect.width + (effectiveSize.width - baseRect.width) * ratio;
    const height = baseRect.height + (effectiveSize.height - baseRect.height) * ratio;
    const currentCrop = getImageCropRect(node, paint);
    const centerX = currentCrop.x + currentCrop.width / 2;
    const centerY = currentCrop.y + currentCrop.height / 2;

    return { height, rotation: currentCrop.rotation, width, x: centerX - width / 2, y: centerY - height / 2 };
  }
};
