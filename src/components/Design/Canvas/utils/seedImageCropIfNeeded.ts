// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { isAppearanceNode, TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImageCrop, TImagePaint } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getEffectiveImageSize } from './getEffectiveImageSize';
import { getImageFillContainRect } from 'utils/canvas/drawVectorNode/getImageFillContainRect';

const seedInitialCropRect = (node: TAppearanceNode, paint: TImagePaint): TImageCrop => {
  const bounds = { height: node.height, width: node.width, x: node.x, y: node.y };
  const effectiveSize = getEffectiveImageSize(paint);
  const rect = effectiveSize ? getImageFillContainRect(bounds, effectiveSize.width, effectiveSize.height) : bounds;

  return { height: rect.height, rotation: node.rotation, width: rect.width, x: rect.x, y: rect.y };
};

export const seedImageCropIfNeeded = (dispatch: AppDispatch, node: TSceneNode | undefined, paintIndex: number): void => {
  if (node && isAppearanceNode(node)) {
    const paint = node.fills[paintIndex];

    if (paint?.type === 'image' && !paint.crop) {
      const isLeavingTile = paint.scaleMode === 'tile';
      const paintForCrop = isLeavingTile ? { ...paint, scale: undefined, scaleMode: 'fill' as const } : paint;
      const crop = seedInitialCropRect(node, paintForCrop);
      const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paintForCrop, crop } : fill));

      dispatch(updateNode({ changes: { fills }, id: node.id }));
    }
  }
};
