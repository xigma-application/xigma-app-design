// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TPaint } from 'types/design/paint/types';

// utils
import { drawSvgGradientPolygons } from './drawSvgGradientPolygons';
import { drawSvgPolygons } from './drawSvgPolygons';
import { getFillsInPaintOrder } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getFillsInPaintOrder';
import { getScaledFillPaints } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getScaledFillPaints';

const VECTOR_PAINT_TYPES: TPaint['type'][] = ['solid', 'gradient-linear', 'gradient-radial'];

const isVisibleVectorPaint = (paint: TPaint): boolean => paint.visible !== false && VECTOR_PAINT_TYPES.includes(paint.type);

export const drawSvgPaintPolygons = (
  elements: string[],
  defs: string[],
  paints: TPaint[],
  polygons: TPoint[][],
  opacity: number,
  bounds: TDraftRect,
  nodeBounds: TDraftRect | null = null,
): void => {
  getFillsInPaintOrder(getScaledFillPaints(paints, opacity))
    .filter(isVisibleVectorPaint)
    .forEach((paint) => {
      if (paint.type === 'solid') {
        drawSvgPolygons(elements, polygons, paint.color, paint.opacity / 100, bounds);
      } else {
        drawSvgGradientPolygons(elements, defs, paint, polygons, paint.opacity / 100, bounds, nodeBounds);
      }
    });
};
