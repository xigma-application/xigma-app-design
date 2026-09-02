// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { normalizeVector } from 'utils/math/normalizeVector';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TVertexCountValueLabelAnchor = {
  anchor: TPoint;
  direction: TPoint;
};

const ORIGIN: TPoint = { x: 0, y: 0 };
const EXTRA_MARGIN_PX = 4;

export const getVertexCountValueLabelAnchor = (
  bounds: TDraftRect,
  handlePosition: TPoint,
  rotation: number,
  viewport: TViewport,
): TVertexCountValueLabelAnchor => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const outward = normalizeVector({ x: handlePosition.x - center.x, y: handlePosition.y - center.y });
  const extraMargin = EXTRA_MARGIN_PX / viewport.zoom;
  const localAnchor: TPoint = { x: handlePosition.x + outward.x * extraMargin, y: handlePosition.y + outward.y * extraMargin };

  return {
    anchor: rotatePoint(localAnchor, center, rotation),
    direction: rotatePoint(outward, ORIGIN, rotation),
  };
};
