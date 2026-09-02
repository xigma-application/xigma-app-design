// types
import { TCornerRadiusHandle, TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getCornerRadiusHandlePositions } from 'utils/canvas/cornerRadius/getCornerRadiusHandlePositions';
import { normalizeVector } from 'utils/math/normalizeVector';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TCornerRadiusValueLabelAnchor = {
  anchor: TPoint;
  direction: TPoint;
};

const ORIGIN: TPoint = { x: 0, y: 0 };
const CORNER_OUTWARD_DIRECTIONS: Record<TCornerRadiusHandle, TPoint> = {
  ne: { x: 0, y: -1 },
  nw: { x: 0, y: -1 },
  se: { x: 0, y: 1 },
  sw: { x: 0, y: 1 },
};
const EXTRA_MARGIN_PX = 4;

export const getCornerRadiusValueLabelAnchor = (
  bounds: TDraftRect,
  cornerRadius: number,
  rotation: number,
  viewport: TViewport,
  corner: TCornerRadiusHandle,
  isDragging: boolean,
): TCornerRadiusValueLabelAnchor => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const handlePosition = getCornerRadiusHandlePositions(bounds, cornerRadius, viewport, isDragging)[corner];
  const outward = CORNER_OUTWARD_DIRECTIONS[corner];
  const extraMargin = EXTRA_MARGIN_PX / viewport.zoom;
  const localAnchor: TPoint = { x: handlePosition.x + outward.x * extraMargin, y: handlePosition.y + outward.y * extraMargin };

  return {
    anchor: rotatePoint(localAnchor, center, rotation),
    direction: rotatePoint(normalizeVector(outward), ORIGIN, rotation),
  };
};
