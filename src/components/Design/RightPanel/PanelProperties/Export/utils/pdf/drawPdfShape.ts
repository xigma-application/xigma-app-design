import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';
import { TPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { drawPdfPolygons } from './drawPdfPolygons';
import { getBoxFillPolygon } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxFillPolygon';
import { getBoxStrokeRingPolygons } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxStrokeRingPolygons/getBoxStrokeRingPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getFillsInPaintOrder } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getFillsInPaintOrder';
import { getScaledFillPaints } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getScaledFillPaints';
import { hasVectorStroke } from './hasVectorStroke';

const isVisibleSolidPaint = (paint: TPaint): paint is TSolidPaint => paint.type === 'solid' && paint.visible !== false;

const drawPaints = (
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

export const drawPdfShape = (
  page: PDFPage,
  node: TFrameNode | TRectangleNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const opacity = getEffectiveOpacity(node, nodesById);

  drawPaints(page, node.fills, [getBoxFillPolygon(node)], opacity, bounds, graphicsStates);

  if (node.strokes && hasVectorStroke(node)) {
    drawPaints(page, node.strokes, getBoxStrokeRingPolygons(node), opacity, bounds, graphicsStates);
  }
};
