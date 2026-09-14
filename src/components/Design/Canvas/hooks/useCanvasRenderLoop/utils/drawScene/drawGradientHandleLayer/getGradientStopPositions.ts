// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientAngularStopHandlePositions } from './getGradientAngularStopHandlePositions';
import { getGradientStopHandlePositions } from './getGradientStopHandlePositions';

export const getGradientStopPositions = (
  bounds: TDraftRect,
  rotation: number,
  paint: TGradientPaint,
  start: TPoint,
  end: TPoint,
  zoom: number,
): TPoint[] =>
  paint.type === 'gradient-angular'
    ? getGradientAngularStopHandlePositions(bounds, rotation, paint, zoom)
    : getGradientStopHandlePositions(start, end, paint.stops, zoom);
