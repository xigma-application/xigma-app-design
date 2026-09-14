// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientEllipseNormalDirection } from 'components/Design/Canvas/utils/getGradientEllipseNormalDirection';

export const getGradientStopDirections = (
  bounds: TDraftRect,
  rotation: number,
  paint: TGradientPaint,
  awayFromLineDirection: TPoint,
): TPoint[] =>
  paint.type === 'gradient-angular'
    ? paint.stops.map((stop) => getGradientEllipseNormalDirection(bounds, rotation, paint, stop.position))
    : paint.stops.map(() => awayFromLineDirection);
