// types
import { TPoint } from 'types/canvas';

export type TGradientStopValueLabelAnchor = {
  anchor: TPoint;
  direction: TPoint;
};

const EXTRA_MARGIN_PX = 10;
const OFFSET_DIRECTION: TPoint = { x: 0, y: -1 };

export const getGradientStopValueLabelAnchor = (stopPosition: TPoint, zoom: number): TGradientStopValueLabelAnchor => {
  const extraMargin = EXTRA_MARGIN_PX / zoom;

  return {
    anchor: { x: stopPosition.x, y: stopPosition.y - extraMargin },
    direction: OFFSET_DIRECTION,
  };
};
