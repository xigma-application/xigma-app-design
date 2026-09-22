// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { getSvgDiamondGradientPolygon } from './getSvgDiamondGradientPolygon';
import { getSvgDiamondGradientReach } from './getSvgDiamondGradientReach';
import { getSvgGradientColorAt } from './getSvgGradientColorAt';
import { getSvgGradientGeometry } from './getSvgGradientGeometry';
import { getSvgImageClipPathDef } from './getSvgImageClipPathDef';
import { getVectorFillBounds } from 'utils/canvas/drawVectorNode/getVectorFillBounds';
import { registerSvgDef } from './registerSvgDef';

const DIAMOND_GRADIENT_BAND_COUNT = 64;

export const drawSvgDiamondGradientPolygons = (
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
  const radiusRatio = paint.radiusRatio ?? 1;
  const reach = getSvgDiamondGradientReach(geometry, radiusRatio, fillBounds, bounds);
  const clipId = registerSvgDef(defs, 'XigmaClip', (id) => getSvgImageClipPathDef(id, polygons, bounds));
  const bands: string[] = [];

  for (let index = 0; index < DIAMOND_GRADIENT_BAND_COUNT; index += 1) {
    const innerDistance = (index / DIAMOND_GRADIENT_BAND_COUNT) * reach;
    const outerDistance = ((index + 1) / DIAMOND_GRADIENT_BAND_COUNT) * reach;
    const midPosition = (innerDistance + outerDistance) / 2;
    const { color, opacity: stopOpacity } = getSvgGradientColorAt(paint.stops, midPosition);
    const outerPolygon = getSvgDiamondGradientPolygon(geometry, radiusRatio, outerDistance);
    const innerPolygon = getSvgDiamondGradientPolygon(geometry, radiusRatio, innerDistance);

    drawSvgPolygons(bands, [outerPolygon, innerPolygon], color, opacity * stopOpacity, bounds, 'evenodd');
  }

  elements.push(`<g clip-path="url(#${clipId})">${bands.join('')}</g>`);
};
