import { SMART_SELECTION_SWAP_HANDLE_RING_DIAMETER_PX } from 'constant/canvas';

import { TViewport } from 'types/design/types';

export const isSwapHandleOnScreen = (
  centerX: number,
  centerY: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): boolean => {
  const screenX = centerX * viewport.zoom + viewport.x;
  const screenY = centerY * viewport.zoom + viewport.y;
  const reach = SMART_SELECTION_SWAP_HANDLE_RING_DIAMETER_PX;

  return screenX >= -reach && screenX <= canvasWidth + reach && screenY >= -reach && screenY <= canvasHeight + reach;
};
