// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { getFillsInPaintOrder } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getFillsInPaintOrder';
import { getScaledFillPaints } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getScaledFillPaints';

const isVisibleSolidPaint = (paint: TPaint): paint is TSolidPaint => paint.visible !== false && paint.type === 'solid';

export const drawSvgPaintPolygons = (
  elements: string[],
  paints: TPaint[],
  polygons: TPoint[][],
  opacity: number,
  bounds: TDraftRect,
): void => {
  getFillsInPaintOrder(getScaledFillPaints(paints, opacity))
    .filter(isVisibleSolidPaint)
    .forEach((paint) => drawSvgPolygons(elements, polygons, paint.color, paint.opacity / 100, bounds));
};
