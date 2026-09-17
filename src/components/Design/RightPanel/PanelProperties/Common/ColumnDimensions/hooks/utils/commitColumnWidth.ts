// store
import { AppDispatch } from 'store';

// types
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { commitImageCropDimensions } from './commitImageCropDimensions';
import { getLockedDimensionsChanges } from '../../utils/getLockedDimensionsChanges';

export const commitColumnWidth = (
  dispatch: AppDispatch,
  imageCrop: TSelectedImageCrop | undefined,
  height: number,
  commitNodeWidth: TFunc<[number]>,
  nextWidth: number,
): void => {
  if (imageCrop) {
    const changes = getLockedDimensionsChanges('width', nextWidth, imageCrop.crop.width, height, true);
    commitImageCropDimensions(dispatch, imageCrop, changes.width, changes.height);
  } else {
    commitNodeWidth(nextWidth);
  }
};
