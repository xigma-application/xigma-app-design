// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

export const worldToScreen = (point: TPoint, viewport: TViewport): TPoint => ({
  x: point.x * viewport.zoom + viewport.x,
  y: point.y * viewport.zoom + viewport.y,
});
