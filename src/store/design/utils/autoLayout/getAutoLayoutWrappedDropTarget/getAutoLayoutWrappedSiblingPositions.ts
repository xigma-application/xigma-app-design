// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAutoLayoutSiblingPositions } from '../getAutoLayoutDropTarget/getAutoLayoutSiblingPositions';
import { getAutoLayoutWrappedChildPositions } from '../getAutoLayoutWrappedChildPositions';

export const getAutoLayoutWrappedSiblingPositions = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  contentBox: TDraftRect,
  children: TAutoLayoutChildSize[],
  index: number,
  draggedSize: { height: number; width: number },
): Record<string, TPoint> => {
  const simulatedChildren = [...children.slice(0, index), { ...draggedSize, id: '__dragged__' }, ...children.slice(index)];
  const simulatedPositions = getAutoLayoutWrappedChildPositions(
    layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    simulatedChildren,
  );

  return getAutoLayoutSiblingPositions(simulatedPositions);
};
