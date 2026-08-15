// others
import { MIN_SHAPE_SIZE } from '../../../../constants';

// types
import { TPoint, TResizeHandle } from 'types/canvas';
import { TSliceDraft } from '../../types';

// utils
import { getResizedEdges } from './getResizedEdges';

export const getResizedSliceBounds = (origin: TSliceDraft, handle: TResizeHandle, localPoint: TPoint): TSliceDraft => {
  const { rotation } = origin;
  const { x1, x2, y1, y2 } = getResizedEdges(origin, handle, localPoint);

  return {
    height: Math.max(MIN_SHAPE_SIZE, Math.abs(y2 - y1)),
    rotation,
    width: Math.max(MIN_SHAPE_SIZE, Math.abs(x2 - x1)),
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
  };
};
