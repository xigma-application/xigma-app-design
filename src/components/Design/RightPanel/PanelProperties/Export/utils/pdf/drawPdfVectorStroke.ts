import { PDFName, PDFPage } from 'pdf-lib';

// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { drawPdfPaintPolygons } from './drawPdfPaintPolygons';
import { drawPdfPolygons } from './drawPdfPolygons';
import { getStrokeTrianglePolygons } from 'utils/canvas/vectorNetwork/getStrokeTrianglePolygons';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { getVectorNodeThickStrokeVertices } from 'utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices';
import { getVectorStrokeFillShape } from 'utils/canvas/vector/stroke/getVectorStrokeFillShape';
import { getVisibleSolidStrokePaints } from 'utils/canvas/vector/stroke/getVisibleSolidStrokePaints';
import { getVisibleStrokePaints } from 'utils/canvas/vector/stroke/getVisibleStrokePaints';

export const drawPdfVectorStroke = (
  page: PDFPage,
  renderedNode: TVectorNode,
  opacity: number,
  bounds: TDraftRect,
  graphicsStates: Map<number, PDFName>,
): void => {
  const paints = getVisibleStrokePaints(renderedNode.strokes);
  const solidPaints = getVisibleSolidStrokePaints(renderedNode.strokes);

  if (renderedNode.strokeWidth > 0 && paints.length > 0) {
    const shapes = getVectorStrokeFillShape(renderedNode);

    if (shapes && solidPaints.length < paints.length) {
      shapes.forEach(({ polygons }) =>
        drawPdfPaintPolygons(page, paints, polygons, opacity, bounds, graphicsStates, getVectorNodeBounds(renderedNode)),
      );
    } else if (shapes) {
      shapes.forEach(({ fillRule, polygons }) =>
        solidPaints.forEach((paint) =>
          drawPdfPolygons(page, polygons, paint.color, (opacity * paint.opacity) / 100, bounds, graphicsStates, fillRule),
        ),
      );
    } else {
      const triangles = getStrokeTrianglePolygons(getVectorNodeThickStrokeVertices(renderedNode, renderedNode.strokeWidth / 2));

      solidPaints.forEach((paint) =>
        drawPdfPolygons(page, triangles, paint.color, (opacity * paint.opacity) / 100, bounds, graphicsStates, 'nonZero'),
      );
    }
  }
};
