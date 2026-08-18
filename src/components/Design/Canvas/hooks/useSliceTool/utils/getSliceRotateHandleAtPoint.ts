// others
import { CORNER_HANDLE_SIZE, ROTATE_HANDLE_OUTER_RADIUS_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { getUnrotatedQueryPoint } from '../../../utils/getUnrotatedQueryPoint';
import { isPointInRect } from '../../../utils/isPointInRect';

export const getSliceRotateHandleAtPoint = (point: TPoint, slice: TSliceDraft, viewport: TViewport): boolean => {
  const testPoint = getUnrotatedQueryPoint(point, slice, slice.rotation);

  if (isPointInRect(testPoint, slice)) {
    return false;
  }

  const innerRadius = CORNER_HANDLE_SIZE / viewport.zoom;
  const outerRadius = ROTATE_HANDLE_OUTER_RADIUS_PX / viewport.zoom;

  return getRectCorners(slice).some((corner) => {
    const distance = Math.hypot(testPoint.x - corner.x, testPoint.y - corner.y);

    return distance > innerRadius && distance <= outerRadius;
  });
};
