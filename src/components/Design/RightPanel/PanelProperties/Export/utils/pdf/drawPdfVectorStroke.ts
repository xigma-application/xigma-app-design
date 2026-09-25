import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { drawPdfPolygons } from './drawPdfPolygons';
import { getStrokeTrianglePolygons } from 'utils/canvas/vectorNetwork/getStrokeTrianglePolygons';
import { getVectorStrokeShape } from 'utils/canvas/vector/stroke/getVectorStrokeShape';
import { getVectorNodeThickStrokeVertices } from 'utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices';

export const drawPdfVectorStroke = (
  page: PDFPage,
  renderedNode: TVectorNode,
  opacity: number,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  if (renderedNode.strokeWidth > 0 && renderedNode.strokeColor) {
    const shape = getVectorStrokeShape(renderedNode);

    if (shape) {
      drawPdfPolygons(page, shape.polygons, renderedNode.strokeColor, opacity, bounds, graphicsStates, shape.fillRule);
    } else {
      const triangles = getStrokeTrianglePolygons(getVectorNodeThickStrokeVertices(renderedNode, renderedNode.strokeWidth / 2));
      drawPdfPolygons(page, triangles, renderedNode.strokeColor, opacity, bounds, graphicsStates, 'nonZero');
    }
  }
};
