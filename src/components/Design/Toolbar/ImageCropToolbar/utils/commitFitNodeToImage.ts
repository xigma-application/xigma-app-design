// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';

export const commitFitNodeToImage = (dispatch: AppDispatch, node: TAppearanceNode, paint: TImagePaint): void => {
  const crop = getImageCropRect(node, paint);
  dispatch(updateNode({ changes: { height: crop.height, width: crop.width, x: crop.x, y: crop.y }, id: node.id }));
};
