// others
import { MIN_RADIUS_HANDLE_GAP_PX, ZERO_RADIUS_HANDLE_OFFSET_PX } from 'constant/canvas';

// types
import { TCornerRadiusHandle, TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getMaxCornerRadius } from './getMaxCornerRadius';

export const getCornerRadiusHandlePositions = (
  bounds: TDraftRect,
  cornerRadius: number,
  viewport: TViewport,
): Record<TCornerRadiusHandle, TPoint> => {
  const rawScreenGap = ZERO_RADIUS_HANDLE_OFFSET_PX / viewport.zoom;
  const zeroStateScreenGap = Math.min(Math.max(rawScreenGap, MIN_RADIUS_HANDLE_GAP_PX), ZERO_RADIUS_HANDLE_OFFSET_PX);
  const zeroStateOffset = zeroStateScreenGap / viewport.zoom;
  const maxRadius = getMaxCornerRadius(bounds);
  const effectiveRadius = cornerRadius > 0 ? Math.min(cornerRadius, maxRadius) : Math.min(zeroStateOffset, maxRadius);

  return {
    ne: { x: bounds.x + bounds.width - effectiveRadius, y: bounds.y + effectiveRadius },
    nw: { x: bounds.x + effectiveRadius, y: bounds.y + effectiveRadius },
    se: { x: bounds.x + bounds.width - effectiveRadius, y: bounds.y + bounds.height - effectiveRadius },
    sw: { x: bounds.x + effectiveRadius, y: bounds.y + bounds.height - effectiveRadius },
  };
};
