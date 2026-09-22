import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint, TPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { drawPdfGradientPolygons } from './drawPdfGradientPolygons';
import { drawPdfPolygons } from './drawPdfPolygons';
import { getFillsInPaintOrder } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getFillsInPaintOrder';
import { getScaledFillPaints } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getScaledFillPaints';

const PLAIN_PAINT_TYPES: TPaint['type'][] = ['solid', 'gradient-linear', 'gradient-radial', 'gradient-angular', 'gradient-diamond'];

const isVisiblePlainPaint = (paint: TPaint): paint is TSolidPaint | TGradientPaint =>
  paint.visible !== false && PLAIN_PAINT_TYPES.includes(paint.type);

export const drawPdfPaintPolygons = (
  page: PDFPage,
  paints: TPaint[],
  polygons: TPoint[][],
  opacity: number,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
  nodeBounds: TDraftRect | null = null,
): void => {
  getFillsInPaintOrder(getScaledFillPaints(paints, opacity))
    .filter(isVisiblePlainPaint)
    .forEach((paint) => {
      if (paint.type === 'solid') {
        drawPdfPolygons(page, polygons, paint.color, paint.opacity / 100, bounds, graphicsStates);
      } else {
        drawPdfGradientPolygons(page, paint, polygons, paint.opacity / 100, bounds, graphicsStates, nodeBounds);
      }
    });
};
