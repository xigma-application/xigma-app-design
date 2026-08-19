// others
import { CORNER_HANDLE_SIZE, RESIZE_EDGE_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';
import { TViewport } from 'types/design/types';

const getBoundsCorners = (bounds: TDraftRect): { handle: TResizeHandle; point: TPoint }[] => {
  const { height, width, x, y } = bounds;

  return [
    { handle: 'nw', point: { x, y } },
    { handle: 'ne', point: { x: x + width, y } },
    { handle: 'se', point: { x: x + width, y: y + height } },
    { handle: 'sw', point: { x, y: y + height } },
  ];
};

export const getHandleAtBounds = (point: TPoint, bounds: TDraftRect, viewport: TViewport): TResizeHandle | null => {
  const { height, width, x, y } = bounds;
  const corners = getBoundsCorners(bounds);
  const cornerRadius = CORNER_HANDLE_SIZE / viewport.zoom;
  const corner = corners.find(({ point: cornerPoint }) => Math.hypot(point.x - cornerPoint.x, point.y - cornerPoint.y) <= cornerRadius);

  if (!corner) {
    const edgeTolerance = RESIZE_EDGE_HIT_TOLERANCE_PX / viewport.zoom;
    const withinHorizontalSpan = point.x >= x && point.x <= x + width;
    const withinVerticalSpan = point.y >= y && point.y <= y + height;

    switch (true) {
      case withinHorizontalSpan && Math.abs(point.y - y) <= edgeTolerance:
        return 'n';
      case withinHorizontalSpan && Math.abs(point.y - (y + height)) <= edgeTolerance:
        return 's';
      case withinVerticalSpan && Math.abs(point.x - x) <= edgeTolerance:
        return 'w';
      case withinVerticalSpan && Math.abs(point.x - (x + width)) <= edgeTolerance:
        return 'e';
      default:
        return null;
    }
  }

  return corner.handle;
};
