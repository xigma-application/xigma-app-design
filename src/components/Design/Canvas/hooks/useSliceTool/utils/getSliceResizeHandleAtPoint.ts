// others
import { CORNER_HANDLE_SIZE, RESIZE_EDGE_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { TPoint, TResizeHandle } from 'types/canvas';
import { TViewport } from 'types/design/types';
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { getUnrotatedQueryPoint } from '../../../utils/getUnrotatedQueryPoint';

export const getSliceResizeHandleAtPoint = (point: TPoint, slice: TSliceDraft, viewport: TViewport): TResizeHandle | null => {
  const { height, width, x, y } = slice;
  const testPoint = getUnrotatedQueryPoint(point, slice, slice.rotation);
  const corners: { handle: TResizeHandle; point: TPoint }[] = [
    { handle: 'nw', point: { x, y } },
    { handle: 'ne', point: { x: x + width, y } },
    { handle: 'se', point: { x: x + width, y: y + height } },
    { handle: 'sw', point: { x, y: y + height } },
  ];
  const cornerRadius = CORNER_HANDLE_SIZE / viewport.zoom;
  const corner = corners.find(
    ({ point: cornerPoint }) => Math.hypot(testPoint.x - cornerPoint.x, testPoint.y - cornerPoint.y) <= cornerRadius,
  );

  if (!corner) {
    const edgeTolerance = RESIZE_EDGE_HIT_TOLERANCE_PX / viewport.zoom;
    const withinHorizontalSpan = testPoint.x >= x && testPoint.x <= x + width;
    const withinVerticalSpan = testPoint.y >= y && testPoint.y <= y + height;

    switch (true) {
      case withinHorizontalSpan && Math.abs(testPoint.y - y) <= edgeTolerance:
        return 'n';
      case withinHorizontalSpan && Math.abs(testPoint.y - (y + height)) <= edgeTolerance:
        return 's';
      case withinVerticalSpan && Math.abs(testPoint.x - x) <= edgeTolerance:
        return 'w';
      case withinVerticalSpan && Math.abs(testPoint.x - (x + width)) <= edgeTolerance:
        return 'e';
      default:
        return null;
    }
  }

  return corner.handle;
};
