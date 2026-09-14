// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getRectPerimeterPointAtAngle } from 'utils/canvas/getRectPerimeterPointAtAngle';

export const getGradientEndpointsAtAngle = (bounds: TDraftRect, angle: number): { end: TPoint; start: TPoint } => ({
  end: getRectPerimeterPointAtAngle(bounds, angle + Math.PI),
  start: getRectPerimeterPointAtAngle(bounds, angle),
});
