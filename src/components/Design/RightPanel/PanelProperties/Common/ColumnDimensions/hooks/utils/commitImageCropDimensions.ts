// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TImageCrop } from 'types/design/paint/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { getPaintReplaceChange } from 'utils/design/paint/getPaintReplaceChange';

export const commitImageCropDimensions = (
  dispatch: AppDispatch,
  imageCrop: TSelectedImageCrop,
  nextWidth: number,
  nextHeight: number,
): void => {
  const crop: TImageCrop = { ...imageCrop.crop, height: Math.round(nextHeight), width: Math.round(nextWidth) };
  const change = getPaintReplaceChange(imageCrop.node, imageCrop.property, imageCrop.paintIndex, { ...imageCrop.paint, crop });

  dispatch(updateNode({ changes: change, id: imageCrop.node.id }));
};
