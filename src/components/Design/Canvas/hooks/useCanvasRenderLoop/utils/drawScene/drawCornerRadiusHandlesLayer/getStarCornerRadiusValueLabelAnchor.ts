// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getStarCornerRadiusHandlePosition } from 'utils/canvas/cornerRadius/star/getStarCornerRadiusHandlePosition';
import { normalizeVector } from 'utils/math/normalizeVector';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TStarCornerRadiusValueLabelAnchor = {
  anchor: TPoint;
  direction: TPoint;
};

const ORIGIN: TPoint = { x: 0, y: 0 };
// straight up, away from the shape — the star's single handle always sits at its top point
const OUTWARD_DIRECTION: TPoint = { x: 0, y: -1 };
const EXTRA_MARGIN_PX = 4;

export const getStarCornerRadiusValueLabelAnchor = (
  bounds: TDraftRect,
  points: number,
  ratio: number,
  cornerRadius: number,
  rotation: number,
  viewport: TViewport,
  flipX: boolean,
  flipY: boolean,
  isDragging: boolean,
): TStarCornerRadiusValueLabelAnchor => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const handlePosition = getStarCornerRadiusHandlePosition(bounds, points, ratio, cornerRadius, viewport, flipX, flipY, isDragging);
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
