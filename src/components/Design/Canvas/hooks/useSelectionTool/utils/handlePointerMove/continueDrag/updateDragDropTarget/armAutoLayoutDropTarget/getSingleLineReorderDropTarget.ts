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
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  padding: TAutoLayoutPadding,
  siblingSizes: TAutoLayoutChildSize[],
  draggedSizes: TAutoLayoutChildSize[],
  orderedMovedIds: string[],
): TAutoLayoutDropTarget => {
  if (orderedMovedIds.length > 1) {
    return {
      ...dropTarget,
      siblingPositions: getAutoLayoutSingleLineSiblingPositions({
        alignment,
        children: siblingSizes,
        contentBox: getAutoLayoutContentBox(desiredParent, padding),
        counterAxisSpacing,
        draggedSizes,
        index: dropTarget.index,
        itemSpacing,
        layoutMode: desiredParent.layoutMode,
      }),
    };
  }

  return dropTarget;
};
