// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TPaintProperty } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getImageCropRect } from './getImageCropRect';
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { getPaintReplaceChange } from 'utils/design/paint/getPaintReplaceChange';
import { isImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/utils/isImageFrameNode';

export const seedImageCropIfNeeded = (
  dispatch: AppDispatch,
  node: TSceneNode | undefined,
  paintIndex: number,
  property: TPaintProperty = 'fills',
): void => {
  if (node && isImageFrameNode(node)) {
    const paint = getNodePaints(node, property)[paintIndex];

    if ((paint?.type === 'image' || paint?.type === 'video') && !paint.crop) {
      const isLeavingTile = paint.scaleMode === 'tile';
      const paintForCrop = isLeavingTile ? { ...paint, scale: undefined, scaleMode: 'fill' as const } : paint;
      const crop = getImageCropRect(node, paintForCrop);
      dispatch(updateNode({ changes: getPaintReplaceChange(node, property, paintIndex, { ...paintForCrop, crop }), id: node.id }));
    }
  }
};
