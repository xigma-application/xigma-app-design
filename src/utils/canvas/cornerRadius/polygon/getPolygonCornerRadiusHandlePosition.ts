// others
import { MIN_RADIUS_HANDLE_GAP_PX, ZERO_RADIUS_HANDLE_OFFSET_PX } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getMaxPolygonCornerRadius } from './getMaxPolygonCornerRadius';
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';
import { normalizeVector } from 'utils/math/normalizeVector';

export const getPolygonCornerRadiusHandlePosition = (
  bounds: TDraftRect,
  sides: number,
  cornerRadius: number,
  viewport: TViewport,
  isDragging = false,
): TPoint => {
  const [topVertex] = getPolygonPoints(bounds, sides);
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const towardCenter = normalizeVector({ x: center.x - topVertex.x, y: center.y - topVertex.y });
  const rawScreenGap = ZERO_RADIUS_HANDLE_OFFSET_PX / viewport.zoom;
  const zeroStateScreenGap = Math.min(Math.max(rawScreenGap, MIN_RADIUS_HANDLE_GAP_PX), ZERO_RADIUS_HANDLE_OFFSET_PX);
  const zeroStateOffset = zeroStateScreenGap / viewport.zoom;
  const maxRadius = getMaxPolygonCornerRadius(bounds, sides);
  const effectiveRadius = cornerRadius > 0 || isDragging ? Math.min(cornerRadius, maxRadius) : Math.min(zeroStateOffset, maxRadius);

  return { x: topVertex.x + towardCenter.x * effectiveRadius, y: topVertex.y + towardCenter.y * effectiveRadius };
};
