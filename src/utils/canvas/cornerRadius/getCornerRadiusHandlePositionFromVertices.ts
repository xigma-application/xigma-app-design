// others
import { MIN_RADIUS_HANDLE_GAP_PX, ZERO_RADIUS_HANDLE_OFFSET_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getCornerRadiusHandleEffectiveSetback } from './getCornerRadiusHandleEffectiveSetback';
import { getCornerRadiusHandleSetbackMultiplier } from './getCornerRadiusHandleSetbackMultiplier';
import { getVertexAngles } from 'utils/math/getVertexAngles';
import { normalizeVector } from 'utils/math/normalizeVector';

export const getCornerRadiusHandlePositionFromVertices = (
  vertices: TPoint[],
  center: TPoint,
  maxRadius: number,
  cornerRadius: number,
  viewport: TViewport,
  flipX = false,
  flipY = false,
  isDragging = false,
): TPoint => {
  const [topVertex] = vertices;
  const towardCenter = normalizeVector({ x: center.x - topVertex.x, y: center.y - topVertex.y });
  const setbackMultiplier = getCornerRadiusHandleSetbackMultiplier(getVertexAngles(vertices)[0]);
  const rawScreenGap = ZERO_RADIUS_HANDLE_OFFSET_PX / viewport.zoom;
  const zeroStateScreenGap = Math.min(Math.max(rawScreenGap, MIN_RADIUS_HANDLE_GAP_PX), ZERO_RADIUS_HANDLE_OFFSET_PX);
  const zeroStateOffset = zeroStateScreenGap / viewport.zoom;
  const effectiveSetback = getCornerRadiusHandleEffectiveSetback(cornerRadius, maxRadius, setbackMultiplier, zeroStateOffset, isDragging);
  const localPosition: TPoint = { x: topVertex.x + towardCenter.x * effectiveSetback, y: topVertex.y + towardCenter.y * effectiveSetback };

  return flipPoint(localPosition, center, flipX, flipY);
};
