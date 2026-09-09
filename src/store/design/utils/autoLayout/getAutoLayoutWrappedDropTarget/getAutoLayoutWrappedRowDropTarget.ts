// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAutoLayoutDropTarget, type TAutoLayoutDropTarget } from '../getAutoLayoutDropTarget/getAutoLayoutDropTarget';

const NO_PADDING: TAutoLayoutPadding = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

export const getAutoLayoutWrappedRowDropTarget = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  alignment: AlignmentLayout,
  rowFrame: TDraftRect,
  children: TAutoLayoutChildSize[],
  realPositions: TAutoLayoutChildPosition[],
  realStart: number,
  realEnd: number,
  rowOriginalIndex: number | null,
  draggedSize: { height: number; width: number },
  cursorPoint: TPoint,
): TAutoLayoutDropTarget =>
  getAutoLayoutDropTarget(
    layoutMode,
    itemSpacing,
    alignment,
    rowFrame,
    NO_PADDING,
    children.slice(realStart, realEnd),
    realPositions.slice(realStart, realEnd),
    rowOriginalIndex,
    draggedSize,
    cursorPoint,
  );
