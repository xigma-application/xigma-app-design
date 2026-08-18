// others
import { MIN_RADIUS_HANDLE_GAP_PX } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { isBoundsLargeEnoughForHandles } from '../isBoundsLargeEnoughForHandles';

export const shouldShowCornerRadiusHandles = (
  bounds: TDraftRect,
  viewport: TViewport,
  cornerRadius: number,
  isDragging = false,
): boolean => {
  const isRadiusVisibleOnScreen = isDragging || cornerRadius === 0 || cornerRadius * viewport.zoom >= MIN_RADIUS_HANDLE_GAP_PX;

  return isBoundsLargeEnoughForHandles(bounds, viewport) && isRadiusVisibleOnScreen;
};
