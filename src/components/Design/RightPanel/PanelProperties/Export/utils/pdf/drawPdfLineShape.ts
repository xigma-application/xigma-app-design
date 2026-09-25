import { PDFName, PDFPage } from 'pdf-lib';

// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TLineNode, TSceneNode } from 'types/design/types';

// utils
import { drawPdfPolygons } from './drawPdfPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getLineArrowheadPolygons } from 'utils/canvas/shapes/getLineArrowheadPolygons';
import { getLineQuadPoints } from 'utils/canvas/shapes/getLineQuadPoints';

export const drawPdfLineShape = (
  page: PDFPage,
  node: TLineNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const strokeWidth = node.strokeWidth ?? LINE_RENDER_STROKE_WIDTH;
  const polygons = [getLineQuadPoints(node, strokeWidth), ...getLineArrowheadPolygons(node)];

  drawPdfPolygons(page, polygons, node.stroke, getEffectiveOpacity(node, nodesById), bounds, graphicsStates);
};
