// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TImageCrop } from 'types/design/paint/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { rotateShapeNodeOrigin } from './rotateShapeNodeOrigin';

export const rotateImageCropRigidly = (dispatch: AppDispatch, imageCrop: TSelectedImageCrop, nextRotation: number): void => {
  const { crop } = imageCrop;
  const deltaDegrees = nextRotation - crop.rotation;

  if (deltaDegrees !== 0) {
    const pivot = { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 };
    const { rotation, x, y } = rotateShapeNodeOrigin(crop, pivot, deltaDegrees);
    const newCrop: TImageCrop = { height: crop.height, rotation, width: crop.width, x, y };
    const fills = imageCrop.node.fills.map((fill, index) => (index === imageCrop.paintIndex ? { ...imageCrop.paint, crop: newCrop } : fill));

    dispatch(updateNode({ changes: { fills }, id: imageCrop.node.id }));
  }
};
