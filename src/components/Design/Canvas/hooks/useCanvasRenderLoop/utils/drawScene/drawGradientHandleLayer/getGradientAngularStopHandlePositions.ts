// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientEllipseNormalDirection } from 'components/Design/Canvas/utils/getGradientEllipseNormalDirection';
import { getGradientEllipsePoint } from './getGradientEllipsePoint';
import { STOP_HANDLE_OFFSET_PX } from './getGradientStopHandlePositions';

export const getGradientAngularStopHandlePositions = (bounds: TDraftRect, rotation: number, paint: TGradientPaint, zoom: number): TPoint[] => {
  const offset = STOP_HANDLE_OFFSET_PX / zoom;

  return paint.stops.map((stop) => {
    const curvePoint = getGradientEllipsePoint(bounds, rotation, paint, stop.position);
    const direction = getGradientEllipseNormalDirection(bounds, rotation, paint, stop.position);

    return { x: curvePoint.x + direction.x * offset, y: curvePoint.y + direction.y * offset };
  });
};
