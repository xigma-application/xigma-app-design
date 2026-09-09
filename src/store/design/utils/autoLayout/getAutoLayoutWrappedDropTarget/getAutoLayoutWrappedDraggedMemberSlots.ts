// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAutoLayoutWrappedChildPositions } from '../getAutoLayoutWrappedChildPositions/getAutoLayoutWrappedChildPositions';
import { groupAutoLayoutChildrenIntoLines } from '../groupAutoLayoutChildrenIntoLines';

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
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const availablePrimary = isHorizontal ? contentBox.width : contentBox.height;
  const simulatedChildren = [...children.slice(0, index), ...draggedSizes, ...children.slice(index)];
  const simulatedLines = groupAutoLayoutChildrenIntoLines(isHorizontal, itemSpacing, availablePrimary, simulatedChildren);
  const simulatedPositions = getAutoLayoutWrappedChildPositions(
    layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    simulatedLines,
  );

  return simulatedPositions.slice(index, index + draggedSizes.length).map((position) => ({ x: position.x, y: position.y }));
};
