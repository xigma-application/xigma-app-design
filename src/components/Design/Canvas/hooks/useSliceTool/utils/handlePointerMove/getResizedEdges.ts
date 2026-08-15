// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

export const getResizedEdges = (
  origin: TDraftRect,
  handle: TResizeHandle,
  localPoint: TPoint,
): { x1: number; x2: number; y1: number; y2: number } => {
  const { height, width, x, y } = origin;
  const edges = { x1: x, x2: x + width, y1: y, y2: y + height };

  switch (handle) {
    case 'n':
      return { ...edges, y1: localPoint.y };
    case 's':
      return { ...edges, y2: localPoint.y };
    case 'e':
      return { ...edges, x2: localPoint.x };
    case 'w':
      return { ...edges, x1: localPoint.x };
    case 'ne':
      return { ...edges, x2: localPoint.x, y1: localPoint.y };
    case 'nw':
      return { ...edges, x1: localPoint.x, y1: localPoint.y };
    case 'se':
      return { ...edges, x2: localPoint.x, y2: localPoint.y };
    case 'sw':
      return { ...edges, x1: localPoint.x, y2: localPoint.y };
    default:
      return edges;
  }
};
