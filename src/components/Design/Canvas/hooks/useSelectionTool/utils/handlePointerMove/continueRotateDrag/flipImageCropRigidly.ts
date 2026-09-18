// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { getPaintReplaceChange } from 'utils/design/paint/getPaintReplaceChange';

export const flipImageCropRigidly = (dispatch: AppDispatch, imageCrop: TSelectedImageCrop, axis: 'horizontal' | 'vertical'): void => {
  const flipX = axis === 'horizontal' ? !imageCrop.paint.flipX : imageCrop.paint.flipX;
  const flipY = axis === 'vertical' ? !imageCrop.paint.flipY : imageCrop.paint.flipY;
  const change = getPaintReplaceChange(imageCrop.node, imageCrop.property, imageCrop.paintIndex, { ...imageCrop.paint, flipX, flipY });

  dispatch(updateNode({ changes: change, id: imageCrop.node.id }));
};
