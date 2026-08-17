// others
import { MIN_RADIUS_HANDLE_GAP_PX, ZERO_RADIUS_HANDLE_OFFSET_PX } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getCornerRadiusHandleSetbackMultiplier } from 'utils/canvas/cornerRadius/getCornerRadiusHandleSetbackMultiplier';
import { getMaxStarCornerRadius } from './getMaxStarCornerRadius';
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';
import { getVertexAngles } from 'utils/math/getVertexAngles';
import { normalizeVector } from 'utils/math/normalizeVector';

export const getStarCornerRadiusHandlePosition = (
  bounds: TDraftRect,
  points: number,
  ratio: number,
  cornerRadius: number,
  viewport: TViewport,
  isDragging = false,
): TPoint => {
  const vertices = getStarPoints(bounds, points, ratio);
  const [topVertex] = vertices;
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const towardCenter = normalizeVector({ x: center.x - topVertex.x, y: center.y - topVertex.y });
  const setbackMultiplier = getCornerRadiusHandleSetbackMultiplier(getVertexAngles(vertices)[0]);
  const rawScreenGap = ZERO_RADIUS_HANDLE_OFFSET_PX / viewport.zoom;
  const zeroStateScreenGap = Math.min(Math.max(rawScreenGap, MIN_RADIUS_HANDLE_GAP_PX), ZERO_RADIUS_HANDLE_OFFSET_PX);
  const zeroStateOffset = zeroStateScreenGap / viewport.zoom;
  const maxRadius = getMaxStarCornerRadius(bounds, points, ratio);
  const effectiveSetback =
    cornerRadius > 0 || isDragging
      ? Math.min(cornerRadius, maxRadius) * setbackMultiplier
      : Math.min(zeroStateOffset, maxRadius * setbackMultiplier);

  return { x: topVertex.x + towardCenter.x * effectiveSetback, y: topVertex.y + towardCenter.y * effectiveSetback };
};
