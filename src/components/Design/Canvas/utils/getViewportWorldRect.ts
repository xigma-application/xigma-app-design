// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { screenToWorld } from './screenToWorld';

export const getViewportWorldRect = (canvas: HTMLCanvasElement, viewport: TViewport): TDraftRect => {
  const topLeft = screenToWorld({ x: 0, y: 0 }, viewport);
  const bottomRight = screenToWorld({ x: canvas.clientWidth, y: canvas.clientHeight }, viewport);

  return { height: bottomRight.y - topLeft.y, width: bottomRight.x - topLeft.x, x: topLeft.x, y: topLeft.y };
};
