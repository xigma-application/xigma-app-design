import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { drawPdfPaintPolygons } from './drawPdfPaintPolygons';
import { getBoxFillPolygon } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxFillPolygon';
import { getBoxStrokeRingPolygons } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxStrokeRingPolygons/getBoxStrokeRingPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { hasVectorStroke } from './hasVectorStroke';

export const drawPdfBoxShape = (
  page: PDFPage,
  node: TFrameNode | TRectangleNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const opacity = getEffectiveOpacity(node, nodesById);

  drawPdfPaintPolygons(page, node.fills, [getBoxFillPolygon(node)], opacity, bounds, graphicsStates);

  if (node.strokes && hasVectorStroke(node)) {
    drawPdfPaintPolygons(page, node.strokes, getBoxStrokeRingPolygons(node), opacity, bounds, graphicsStates);
  }
};
