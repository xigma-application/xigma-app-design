// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAutoLayoutWrappedChildPositions } from '../getAutoLayoutWrappedChildPositions';

export const getAutoLayoutWrappedDraggedMemberSlots = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  contentBox: TDraftRect,
  children: TAutoLayoutChildSize[],
  index: number,
  draggedSizes: TAutoLayoutChildSize[],
): TPoint[] => {
  const simulatedChildren = [...children.slice(0, index), ...draggedSizes, ...children.slice(index)];
  const simulatedPositions = getAutoLayoutWrappedChildPositions(
    layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    simulatedChildren,
  );

  return simulatedPositions.slice(index, index + draggedSizes.length).map((position) => ({ x: position.x, y: position.y }));
};
