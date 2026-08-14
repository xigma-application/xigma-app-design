// types
import { TDraftRect, TResizeHandle } from 'types/canvas';

// utils
import { HANDLE_AXES, TAxisAnchorSide } from './getResizeAxisAnchors';

const getScaleAxisAnchor = (side: TAxisAnchorSide, start: number, size: number): number => {
  switch (side) {
    case 'max':
      return start;
    case 'min':
      return start + size;
    default:
      return start + size / 2;
  }
};

export const getScaleAxisAnchors = (handle: TResizeHandle, origin: TDraftRect): { x: number; y: number } => {
  const axes = HANDLE_AXES[handle];

  return {
    x: getScaleAxisAnchor(axes.x, origin.x, origin.width),
    y: getScaleAxisAnchor(axes.y, origin.y, origin.height),
  };
};
