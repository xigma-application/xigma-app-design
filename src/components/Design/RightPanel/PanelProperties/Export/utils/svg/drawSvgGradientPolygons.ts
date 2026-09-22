// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { getSvgGradientGeometry } from './getSvgGradientGeometry';
import { getSvgLinearGradientDef } from './getSvgLinearGradientDef';
import { getSvgRadialGradientDef } from './getSvgRadialGradientDef';
import { getVectorFillBounds } from 'utils/canvas/drawVectorNode/getVectorFillBounds';
import { registerSvgGradientDef } from './registerSvgGradientDef';

export const drawSvgGradientPolygons = (
  elements: string[],
  defs: string[],
  paint: TGradientPaint,
  polygons: TPoint[][],
  opacity: number,
  bounds: TDraftRect,
  nodeBounds: TDraftRect | null = null,
): void => {
  const fillBounds = getVectorFillBounds(polygons, nodeBounds);
  const geometry = getSvgGradientGeometry(paint, fillBounds, bounds);
  const id =
    paint.type === 'gradient-linear'
      ? registerSvgGradientDef(defs, (gradientId) => getSvgLinearGradientDef(gradientId, paint.stops, geometry))
      : registerSvgGradientDef(defs, (gradientId) => getSvgRadialGradientDef(gradientId, paint.stops, geometry, paint.radiusRatio));

  drawSvgPolygons(elements, polygons, `url(#${id})`, opacity, bounds);
};
