// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { getImageCropRect } from './getImageCropRect';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

export const seedImageCropIfNeeded = (dispatch: AppDispatch, node: TSceneNode | undefined, paintIndex: number): void => {
  if (node && isAppearanceNode(node)) {
    const paint = node.fills[paintIndex];

    if (paint?.type === 'image' && !paint.crop) {
      const crop = getImageCropRect(node, paint);
      const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paint, crop } : fill));

      dispatch(updateNode({ changes: { fills }, id: node.id }));
    }
  }
};
