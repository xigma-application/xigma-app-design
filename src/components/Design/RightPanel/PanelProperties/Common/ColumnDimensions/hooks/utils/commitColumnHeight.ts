// store
import { AppDispatch } from 'store';

// types
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { commitImageCropDimensions } from './commitImageCropDimensions';
import { getLockedDimensionsChanges } from '../../utils/getLockedDimensionsChanges';

export const commitColumnHeight = (
  dispatch: AppDispatch,
  imageCrop: TSelectedImageCrop | undefined,
  width: number,
  commitNodeHeight: TFunc<[number]>,
  nextHeight: number,
): void => {
  if (imageCrop) {
    const changes = getLockedDimensionsChanges('height', nextHeight, width, imageCrop.crop.height, true);
    commitImageCropDimensions(dispatch, imageCrop, changes.width, changes.height);
  } else {
    commitNodeHeight(nextHeight);
  }
};
