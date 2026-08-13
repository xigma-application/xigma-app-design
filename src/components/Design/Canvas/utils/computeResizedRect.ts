// others
import { MIN_SHAPE_SIZE } from '../constants';

// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

// utils
import { HANDLE_AXES } from './getResizeAxisAnchors';

const resizeAxis = (
  originStart: number,
  originSize: number,
  pointCoord: number,
  edge: 'max' | 'min' | 'none',
): { size: number; start: number } => {
  switch (edge) {
    case 'none':
      return { size: originSize, start: originStart };
    default: {
      const anchorCoord = edge === 'max' ? originStart : originStart + originSize;
      const delta = pointCoord - anchorCoord;
      const size = Math.max(MIN_SHAPE_SIZE, Math.abs(delta));

      return { size, start: delta >= 0 ? anchorCoord : anchorCoord - size };
    }
  }
};

export const computeResizedRect = (handle: TResizeHandle, origin: TDraftRect, point: TPoint): TDraftRect => {
  const axes = HANDLE_AXES[handle];
  const horizontal = resizeAxis(origin.x, origin.width, point.x, axes.x);
  const vertical = resizeAxis(origin.y, origin.height, point.y, axes.y);

  return { height: vertical.size, width: horizontal.size, x: horizontal.start, y: vertical.start };
};
