// others
import { MIN_ELEMENT_SCREEN_SIZE_FOR_RADIUS_HANDLES_PX, MIN_RADIUS_HANDLE_GAP_PX } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

export const shouldShowCornerRadiusHandles = (
  bounds: TDraftRect,
  viewport: TViewport,
  cornerRadius: number,
  isDragging = false,
): boolean => {
  const isLargeEnoughOnScreen = Math.min(bounds.width, bounds.height) * viewport.zoom >= MIN_ELEMENT_SCREEN_SIZE_FOR_RADIUS_HANDLES_PX;
  const isRadiusVisibleOnScreen = isDragging || cornerRadius === 0 || cornerRadius * viewport.zoom >= MIN_RADIUS_HANDLE_GAP_PX;

  return isLargeEnoughOnScreen && isRadiusVisibleOnScreen;
};
