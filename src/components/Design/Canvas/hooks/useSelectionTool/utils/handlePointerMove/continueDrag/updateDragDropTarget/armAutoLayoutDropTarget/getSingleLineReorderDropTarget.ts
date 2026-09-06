// store
import { getAutoLayoutContentBox, TAutoLayoutPadding } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';
import { getAutoLayoutSingleLineSiblingPositions } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutSingleLineSiblingPositions';

// types
import { AlignmentLayout } from 'types/design/enums';
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions';
import { TAutoLayoutDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDropTarget';
import { TAutoLayoutFrame } from '../types';

export const getSingleLineReorderDropTarget = (
  dropTarget: TAutoLayoutDropTarget,
  desiredParent: TAutoLayoutFrame,
  itemSpacing: number,
  alignment: AlignmentLayout,
  padding: TAutoLayoutPadding,
  siblingSizes: TAutoLayoutChildSize[],
  draggedSizes: TAutoLayoutChildSize[],
  orderedMovedIds: string[],
): TAutoLayoutDropTarget => {
  if (orderedMovedIds.length > 1) {
    return {
      ...dropTarget,
      siblingPositions: getAutoLayoutSingleLineSiblingPositions(
        desiredParent.layoutMode,
        itemSpacing,
        alignment,
        getAutoLayoutContentBox(desiredParent, padding),
        siblingSizes,
        dropTarget.index,
        draggedSizes,
      ),
    };
  }

  return dropTarget;
};
