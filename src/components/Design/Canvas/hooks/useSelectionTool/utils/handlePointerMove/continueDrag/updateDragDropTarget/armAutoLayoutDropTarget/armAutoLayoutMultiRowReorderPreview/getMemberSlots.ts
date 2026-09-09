// store
import { getAutoLayoutWrappedDraggedMemberSlots } from 'store/design/utils/autoLayout/getAutoLayoutWrappedDropTarget/getAutoLayoutWrappedDraggedMemberSlots';

// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getContiguousMemberSlots } from './getContiguousMemberSlots';

export const getMemberSlots = (
  isChasm: boolean,
  isHorizontal: boolean,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  contentBox: TDraftRect,
  siblingSizes: TAutoLayoutChildSize[],
  index: number,
  draggedSizes: TAutoLayoutChildSize[],
): TPoint[] => {
  if (isChasm) {
    return getContiguousMemberSlots(isHorizontal, draggedSizes, itemSpacing);
  }

  return getAutoLayoutWrappedDraggedMemberSlots(
    layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    siblingSizes,
    index,
    draggedSizes,
  );
};
