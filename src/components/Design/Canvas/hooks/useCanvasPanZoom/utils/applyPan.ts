// types
import { TViewport } from 'types/design/types';

export const applyPan = (viewport: TViewport, deltaX: number, deltaY: number): TViewport => ({
  ...viewport,
  x: viewport.x - deltaX,
  y: viewport.y - deltaY,
});
