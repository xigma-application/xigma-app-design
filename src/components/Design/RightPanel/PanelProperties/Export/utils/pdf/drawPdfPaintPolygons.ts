import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { drawPdfPolygons } from './drawPdfPolygons';
import { getFillsInPaintOrder } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getFillsInPaintOrder';
import { getScaledFillPaints } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getScaledFillPaints';

const isVisibleSolidPaint = (paint: TPaint): paint is TSolidPaint => paint.type === 'solid' && paint.visible !== false;

export const drawPdfPaintPolygons = (
  page: PDFPage,
  paints: TPaint[],
  polygons: TPoint[][],
  opacity: number,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  getFillsInPaintOrder(getScaledFillPaints(paints, opacity))
    .filter(isVisibleSolidPaint)
    .forEach((paint) => {
      drawPdfPolygons(page, polygons, paint.color, paint.opacity / 100, bounds, graphicsStates);
    });
};
