// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAutoLayoutContentBox, type TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { getAutoLayoutCursorRowRange } from './getAutoLayoutCursorRowRange';
import { getAutoLayoutDropTarget, type TAutoLayoutDropTarget } from '../getAutoLayoutDropTarget/getAutoLayoutDropTarget';
import { getAutoLayoutRowFrame } from './getAutoLayoutRowFrame';
import { getAutoLayoutWrappedChildPositions } from '../getAutoLayoutWrappedChildPositions';

const NO_PADDING: TAutoLayoutPadding = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

export const getAutoLayoutWrappedDropTarget = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  frame: TDraftRect,
  padding: TAutoLayoutPadding,
  children: TAutoLayoutChildSize[],
  draggedSize: { height: number; width: number },
  cursorPoint: TPoint,
): TAutoLayoutDropTarget => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const contentBox = getAutoLayoutContentBox(frame, padding);
  const realPositions = getAutoLayoutWrappedChildPositions(layoutMode, itemSpacing, counterAxisSpacing, alignment, contentBox, children);
  const { bandEnd, bandStart, end, start } = getAutoLayoutCursorRowRange(
    isHorizontal,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    children,
    cursorPoint,
  );
  const rowFrame = getAutoLayoutRowFrame(isHorizontal, contentBox, bandStart, bandEnd);
  const rowChildren = children.slice(start, end);
  const rowRealPositions = realPositions.slice(start, end);
  const rowDropTarget = getAutoLayoutDropTarget(
    layoutMode,
    itemSpacing,
    alignment,
    rowFrame,
    NO_PADDING,
    rowChildren,
    rowRealPositions,
    null,
    draggedSize,
    cursorPoint,
  );
  const siblingPositions = realPositions.reduce<Record<string, TPoint>>((positionsById, position) => {
    positionsById[position.id] = { x: position.x, y: position.y };

    return positionsById;
  }, {});

  return {
    index: start + rowDropTarget.index,
    indicator: rowDropTarget.indicator,
    siblingPositions: { ...siblingPositions, ...rowDropTarget.siblingPositions },
  };
};
