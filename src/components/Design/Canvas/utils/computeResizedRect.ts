// others
import { MIN_SHAPE_SIZE } from '../constants';

// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

type TAxisEdge = 'max' | 'min' | 'none';

const HANDLE_AXES: Record<TResizeHandle, { x: TAxisEdge; y: TAxisEdge }> = {
  e: { x: 'max', y: 'none' },
  n: { x: 'none', y: 'min' },
  ne: { x: 'max', y: 'min' },
  nw: { x: 'min', y: 'min' },
  s: { x: 'none', y: 'max' },
  se: { x: 'max', y: 'max' },
  sw: { x: 'min', y: 'max' },
  w: { x: 'min', y: 'none' },
};

const resizeAxis = (originStart: number, originSize: number, pointCoord: number, edge: TAxisEdge): { size: number; start: number } => {
  switch (edge) {
    case 'none':
      return { size: originSize, start: originStart };
    case 'max':
      return { size: Math.max(MIN_SHAPE_SIZE, pointCoord - originStart), start: originStart };
    default: {
      const size = Math.max(MIN_SHAPE_SIZE, originStart + originSize - pointCoord);
      return { size, start: originStart + originSize - size };
    }
  }
};

export const computeResizedRect = (handle: TResizeHandle, origin: TDraftRect, point: TPoint): TDraftRect => {
  const axes = HANDLE_AXES[handle];
  const horizontal = resizeAxis(origin.x, origin.width, point.x, axes.x);
  const vertical = resizeAxis(origin.y, origin.height, point.y, axes.y);

  return { height: vertical.size, width: horizontal.size, x: horizontal.start, y: vertical.start };
};
