// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getPolygonCornerRadiusHandlePosition } from 'utils/canvas/cornerRadius/polygon/getPolygonCornerRadiusHandlePosition';
import { normalizeVector } from 'utils/math/normalizeVector';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TPolygonCornerRadiusValueLabelAnchor = {
  anchor: TPoint;
  direction: TPoint;
};

const ORIGIN: TPoint = { x: 0, y: 0 };
const OUTWARD_DIRECTION: TPoint = { x: 0, y: -1 };
const EXTRA_MARGIN_PX = 4;

export const getPolygonCornerRadiusValueLabelAnchor = (
  bounds: TDraftRect,
  sides: number,
  cornerRadius: number,
  rotation: number,
  viewport: TViewport,
  flipX: boolean,
  flipY: boolean,
  isDragging: boolean,
): TPolygonCornerRadiusValueLabelAnchor => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const handlePosition = getPolygonCornerRadiusHandlePosition(bounds, sides, cornerRadius, viewport, flipX, flipY, isDragging);
  const extraMargin = EXTRA_MARGIN_PX / viewport.zoom;
  const localAnchor: TPoint = {
    x: handlePosition.x + OUTWARD_DIRECTION.x * extraMargin,
    y: handlePosition.y + OUTWARD_DIRECTION.y * extraMargin,
  };

  return {
    anchor: rotatePoint(localAnchor, center, rotation),
    direction: rotatePoint(normalizeVector(OUTWARD_DIRECTION), ORIGIN, rotation),
  };
};
