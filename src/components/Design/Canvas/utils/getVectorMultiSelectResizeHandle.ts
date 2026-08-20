// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getHandleAtBounds } from './getResizeHandleAtPoint/getHandleAtBounds';
import { isPointInRect } from './isPointInRect';
import { rotatePoint } from 'utils/math/rotatePoint';

const CORNER_HANDLES: TResizeHandle[] = ['ne', 'nw', 'se', 'sw'];

export const getVectorMultiSelectResizeHandle = (
  point: TPoint,
  bounds: TDraftRect,
  viewport: TViewport,
  rotation: number,
): TResizeHandle | null => {
  const pivot: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const localPoint = rotatePoint(point, pivot, -rotation);
  const handle = getHandleAtBounds(localPoint, bounds, viewport);

  if (handle && CORNER_HANDLES.includes(handle) && !isPointInRect(localPoint, bounds)) {
    return null;
  }

  return handle;
};
