// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { normalizeVector } from 'utils/math/normalizeVector';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TEllipseArcValueLabelAnchor = {
  anchor: TPoint;
  direction: TPoint;
};

const ORIGIN: TPoint = { x: 0, y: 0 };
const EXTRA_MARGIN_PX = 4;
const OFFSET_DIRECTION: TPoint = normalizeVector({ x: 1, y: -1 });

export const getEllipseArcValueLabelAnchor = (
  bounds: TDraftRect,
  handlePosition: TPoint,
  rotation: number,
  viewport: TViewport,
): TEllipseArcValueLabelAnchor => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const extraMargin = EXTRA_MARGIN_PX / viewport.zoom;
  const localAnchor: TPoint = {
    x: handlePosition.x + OFFSET_DIRECTION.x * extraMargin,
    y: handlePosition.y + OFFSET_DIRECTION.y * extraMargin,
  };

  return {
    anchor: rotatePoint(localAnchor, center, rotation),
    direction: rotatePoint(OFFSET_DIRECTION, ORIGIN, rotation),
  };
};
