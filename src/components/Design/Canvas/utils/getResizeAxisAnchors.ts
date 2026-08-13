// types
import { TDraftRect, TResizeHandle } from 'types/canvas';

type TAxisAnchorSide = 'max' | 'min' | 'none';

export const HANDLE_AXES: Record<TResizeHandle, { x: TAxisAnchorSide; y: TAxisAnchorSide }> = {
  e: { x: 'max', y: 'none' },
  n: { x: 'none', y: 'min' },
  ne: { x: 'max', y: 'min' },
  nw: { x: 'min', y: 'min' },
  s: { x: 'none', y: 'max' },
  se: { x: 'max', y: 'max' },
  sw: { x: 'min', y: 'max' },
  w: { x: 'min', y: 'none' },
};

const getAxisAnchor = (side: TAxisAnchorSide, start: number, size: number): number | null => {
  switch (side) {
    case 'none':
      return null;
    case 'max':
      return start;
    default:
      return start + size;
  }
};

export const getResizeAxisAnchors = (handle: TResizeHandle, origin: TDraftRect): { x: number | null; y: number | null } => {
  const axes = HANDLE_AXES[handle];

  return {
    x: getAxisAnchor(axes.x, origin.x, origin.width),
    y: getAxisAnchor(axes.y, origin.y, origin.height),
  };
};
