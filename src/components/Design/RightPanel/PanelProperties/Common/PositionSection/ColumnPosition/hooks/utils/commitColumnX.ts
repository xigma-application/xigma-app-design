// store
import { AppDispatch } from 'store';

// types
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { commitColumnPosition } from './commitColumnPosition';
import { commitImageCropPosition } from './commitImageCropPosition';
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';

type TParent = Parameters<typeof getNodeAbsoluteFromParentPosition>[1];

export const commitColumnX = (
  dispatch: AppDispatch,
  imageCrop: TSelectedImageCrop | undefined,
  id: string,
  parent: TParent | undefined,
  y: number,
  nextX: number,
): void => {
  if (imageCrop) {
    commitImageCropPosition(dispatch, imageCrop, parent, nextX, y);
  } else {
    commitColumnPosition(dispatch, id, parent, nextX, y);
  }
};
