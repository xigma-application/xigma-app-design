// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { getStrokeTrianglePolygons } from 'utils/canvas/vectorNetwork/getStrokeTrianglePolygons';
import { getVectorStrokeShape } from 'utils/canvas/vector/stroke/getVectorStrokeShape';
import { getVectorNodeThickStrokeVertices } from 'utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices';

export const drawSvgVectorStroke = (elements: string[], renderedNode: TVectorNode, opacity: number, bounds: TDraftRect): void => {
  if (renderedNode.strokeWidth > 0 && renderedNode.strokeColor) {
    const shapes = getVectorStrokeShape(renderedNode);

    if (shapes) {
      shapes.forEach(({ fillRule, polygons }) => {
        drawSvgPolygons(elements, polygons, renderedNode.strokeColor, opacity, bounds, fillRule === 'nonZero' ? 'nonzero' : 'evenodd');
      });
    } else {
      const triangles = getStrokeTrianglePolygons(getVectorNodeThickStrokeVertices(renderedNode, renderedNode.strokeWidth / 2));
      drawSvgPolygons(elements, triangles, renderedNode.strokeColor, opacity, bounds, 'nonzero');
    }
  }
};
