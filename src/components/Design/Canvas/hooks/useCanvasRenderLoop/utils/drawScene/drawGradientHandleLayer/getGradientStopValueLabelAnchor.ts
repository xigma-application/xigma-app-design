// types
import { TPoint } from 'types/canvas';

export type TGradientStopValueLabelAnchor = {
  anchor: TPoint;
  direction: TPoint;
};

const EXTRA_MARGIN_PX = 10;

export const getGradientStopValueLabelAnchor = (
  stopPosition: TPoint,
  awayFromLineDirection: TPoint,
  zoom: number,
): TGradientStopValueLabelAnchor => {
  const extraMargin = EXTRA_MARGIN_PX / zoom;

  return {
    anchor: { x: stopPosition.x + awayFromLineDirection.x * extraMargin, y: stopPosition.y + awayFromLineDirection.y * extraMargin },
    direction: awayFromLineDirection,
  };
};
