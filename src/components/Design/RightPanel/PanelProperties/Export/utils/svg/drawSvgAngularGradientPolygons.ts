// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { getSvgAngularGradientPoint } from './getSvgAngularGradientPoint';
import { getSvgAngularGradientReach } from './getSvgAngularGradientReach';
import { getSvgGradientColorAt } from './getSvgGradientColorAt';
import { getSvgGradientGeometry } from './getSvgGradientGeometry';
import { getSvgImageClipPathDef } from './getSvgImageClipPathDef';
import { getVectorFillBounds } from 'utils/canvas/drawVectorNode/getVectorFillBounds';
import { registerSvgDef } from './registerSvgDef';

const ANGULAR_GRADIENT_SECTOR_COUNT = 120;

export const drawSvgAngularGradientPolygons = (
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
  const reach = getSvgAngularGradientReach(geometry, fillBounds, bounds);
  const clipId = registerSvgDef(defs, 'XigmaClip', (id) => getSvgImageClipPathDef(id, polygons, bounds));
  const sectors: string[] = [];

  for (let index = 0; index < ANGULAR_GRADIENT_SECTOR_COUNT; index += 1) {
    const startAngle = (index / ANGULAR_GRADIENT_SECTOR_COUNT) * Math.PI * 2;
    const endAngle = ((index + 1) / ANGULAR_GRADIENT_SECTOR_COUNT) * Math.PI * 2;
    const midPosition = (index + 0.5) / ANGULAR_GRADIENT_SECTOR_COUNT;
    const { color, opacity: stopOpacity } = getSvgGradientColorAt(paint.stops, midPosition);
    const triangle = [
      geometry.start,
      getSvgAngularGradientPoint(geometry, radiusRatio, reach, startAngle),
      getSvgAngularGradientPoint(geometry, radiusRatio, reach, endAngle),
    ];

    drawSvgPolygons(sectors, [triangle], color, opacity * stopOpacity, bounds);
  }

  elements.push(`<g clip-path="url(#${clipId})">${sectors.join('')}</g>`);
};
