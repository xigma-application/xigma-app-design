// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

export const getResizeAnchorPoint = (handle: TResizeHandle, origin: TDraftRect): TPoint | null => {
  switch (handle) {
    case 'nw':
      return { x: origin.x + origin.width, y: origin.y + origin.height };
    case 'ne':
      return { x: origin.x, y: origin.y + origin.height };
    case 'se':
      return { x: origin.x, y: origin.y };
    case 'sw':
      return { x: origin.x + origin.width, y: origin.y };
    default:
      return null;
  }
};
