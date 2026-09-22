import { PDFName, PDFPage } from 'pdf-lib';

// others
import { ARROWHEAD_LENGTH, ARROWHEAD_STROKE_WIDTH, LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TLineNode, TSceneNode } from 'types/design/types';

// utils
import { drawPdfPolygons } from './drawPdfPolygons';
import { getArrowheadPolygons } from './getArrowheadPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getLineQuadPoints } from './getLineQuadPoints';

const getEndpointArrowheadPolygons = (node: TLineNode, strokeWidth: number): TPoint[][] => {
  const dx = node.x2 - node.x1;
  const dy = node.y2 - node.y1;
  const length = Math.hypot(dx, dy);

  if (length !== 0) {
    const direction: TPoint = { x: dx / length, y: dy / length };
    const polygons: TPoint[][] = [];

    if (node.endPoint === 'arrow') {
      polygons.push(...getArrowheadPolygons({ x: node.x2, y: node.y2 }, direction, ARROWHEAD_LENGTH, strokeWidth));
    }

    if (node.startPoint === 'arrow') {
      polygons.push(
        ...getArrowheadPolygons({ x: node.x1, y: node.y1 }, { x: -direction.x, y: -direction.y }, ARROWHEAD_LENGTH, strokeWidth),
      );
    }

    return polygons;
  }

  return [];
};

export const drawPdfLineShape = (
  page: PDFPage,
  node: TLineNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const strokeWidth = node.strokeWidth ?? LINE_RENDER_STROKE_WIDTH;
  const polygons = [getLineQuadPoints(node, strokeWidth), ...getEndpointArrowheadPolygons(node, ARROWHEAD_STROKE_WIDTH)];

  drawPdfPolygons(page, polygons, node.stroke, getEffectiveOpacity(node, nodesById), bounds, graphicsStates);
};
