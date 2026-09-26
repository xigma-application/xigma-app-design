// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { drawSvgPaintPolygons } from './drawSvgPaintPolygons';
import { drawSvgPolygons } from './drawSvgPolygons';
import { getStrokeTrianglePolygons } from 'utils/canvas/vectorNetwork/getStrokeTrianglePolygons';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { getVectorNodeThickStrokeVertices } from 'utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices';
import { getVectorStrokeFillShape } from 'utils/canvas/vector/stroke/getVectorStrokeFillShape';
import { getVisibleSolidStrokePaints } from 'utils/canvas/vector/stroke/getVisibleSolidStrokePaints';
import { getVisibleStrokePaints } from 'utils/canvas/vector/stroke/getVisibleStrokePaints';

export const drawSvgVectorStroke = async (
  elements: string[],
  defs: string[],
  renderedNode: TVectorNode,
  opacity: number,
  bounds: TDraftRect,
): Promise<void> => {
  const paints = getVisibleStrokePaints(renderedNode.strokes);
  const solidPaints = getVisibleSolidStrokePaints(renderedNode.strokes);

  if (renderedNode.strokeWidth > 0 && paints.length > 0) {
    const shapes = getVectorStrokeFillShape(renderedNode);

    if (shapes && solidPaints.length < paints.length) {
      for (const { polygons } of shapes) {
        await drawSvgPaintPolygons(elements, defs, paints, polygons, opacity, bounds, getVectorNodeBounds(renderedNode));
      }
    } else if (shapes) {
      shapes.forEach(({ fillRule, polygons }) =>
        solidPaints.forEach((paint) =>
          drawSvgPolygons(
            elements,
            polygons,
            paint.color,
            (opacity * paint.opacity) / 100,
            bounds,
            fillRule === 'nonZero' ? 'nonzero' : 'evenodd',
          ),
        ),
      );
    } else {
      const triangles = getStrokeTrianglePolygons(getVectorNodeThickStrokeVertices(renderedNode, renderedNode.strokeWidth / 2));
      solidPaints.forEach((paint) => drawSvgPolygons(elements, triangles, paint.color, (opacity * paint.opacity) / 100, bounds, 'nonzero'));
    }
  }
};
