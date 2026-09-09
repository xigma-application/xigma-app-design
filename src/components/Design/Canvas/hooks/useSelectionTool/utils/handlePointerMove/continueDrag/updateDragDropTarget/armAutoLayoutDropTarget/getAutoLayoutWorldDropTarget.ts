// store
import { getAutoLayoutRotatedPositions } from 'store/design/utils/autoLayout/getAutoLayoutRotatedPositions';
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAutoLayoutDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDropTarget';

// types
import { TPoint } from 'types/canvas';

// utils
import { getAutoLayoutSizesById } from './getAutoLayoutSizesById';

export const getAutoLayoutWorldDropTarget = (
  dropTarget: TAutoLayoutDropTarget,
  siblingSizes: TAutoLayoutChildSize[],
  frameCenter: TPoint,
  frameRotation: number,
): TAutoLayoutDropTarget => ({
  ...dropTarget,
  siblingPositions: getAutoLayoutRotatedPositions(
    dropTarget.siblingPositions,
    getAutoLayoutSizesById(siblingSizes),
    frameCenter,
    frameRotation,
  ),
});
