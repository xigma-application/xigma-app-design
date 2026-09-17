// store
import { AppDispatch } from 'store';

// types
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { commitColumnPosition } from './commitColumnPosition';
import { commitImageCropPosition } from './commitImageCropPosition';
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';

type TParent = Parameters<typeof getNodeAbsoluteFromParentPosition>[1];

export const commitColumnY = (
  dispatch: AppDispatch,
  imageCrop: TSelectedImageCrop | undefined,
  id: string,
  parent: TParent | undefined,
  x: number,
  nextY: number,
): void => {
  if (imageCrop) {
    commitImageCropPosition(dispatch, imageCrop, parent, x, nextY);
  } else {
    commitColumnPosition(dispatch, id, parent, x, nextY);
  }
};
