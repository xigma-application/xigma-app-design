// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

export const flipImageCropRigidly = (dispatch: AppDispatch, imageCrop: TSelectedImageCrop, axis: 'horizontal' | 'vertical'): void => {
  const flipX = axis === 'horizontal' ? !imageCrop.paint.flipX : imageCrop.paint.flipX;
  const flipY = axis === 'vertical' ? !imageCrop.paint.flipY : imageCrop.paint.flipY;
  const fills = imageCrop.node.fills.map((fill, index) => (index === imageCrop.paintIndex ? { ...imageCrop.paint, flipX, flipY } : fill));

  dispatch(updateNode({ changes: { fills }, id: imageCrop.node.id }));
};
