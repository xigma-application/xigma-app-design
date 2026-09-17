// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TImageCrop } from 'types/design/paint/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

export const commitImageCropDimensions = (
  dispatch: AppDispatch,
  imageCrop: TSelectedImageCrop,
  nextWidth: number,
  nextHeight: number,
): void => {
  const crop: TImageCrop = { ...imageCrop.crop, height: Math.round(nextHeight), width: Math.round(nextWidth) };
  const fills = imageCrop.node.fills.map((fill, index) => (index === imageCrop.paintIndex ? { ...imageCrop.paint, crop } : fill));

  dispatch(updateNode({ changes: { fills }, id: imageCrop.node.id }));
};
