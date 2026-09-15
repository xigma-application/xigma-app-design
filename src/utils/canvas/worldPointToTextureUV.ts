// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

export const worldPointToTextureUV = (point: TPoint, viewport: TViewport, canvasWidth: number, canvasHeight: number): TPoint => {
  const screenX = point.x * viewport.zoom + viewport.x;
  const screenY = point.y * viewport.zoom + viewport.y;

  return { x: screenX / canvasWidth, y: 1 - screenY / canvasHeight };
};
