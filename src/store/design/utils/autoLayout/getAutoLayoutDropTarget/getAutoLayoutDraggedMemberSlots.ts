// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAutoLayoutChildPositions, type TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';

export const getAutoLayoutDraggedMemberSlots = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  alignment: AlignmentLayout,
  contentBox: TDraftRect,
  children: TAutoLayoutChildSize[],
  index: number,
  draggedSizes: TAutoLayoutChildSize[],
): TPoint[] => {
  const simulatedChildren = [...children.slice(0, index), ...draggedSizes, ...children.slice(index)];
  const simulatedPositions = getAutoLayoutChildPositions(layoutMode, itemSpacing, alignment, contentBox, simulatedChildren);

  return simulatedPositions.slice(index, index + draggedSizes.length).map((position) => ({ x: position.x, y: position.y }));
};
