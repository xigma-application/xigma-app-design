// others
import { ARROWHEAD_LENGTH, ARROWHEAD_STROKE_WIDTH } from 'constant/canvas';

// types
import { TLineNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getArrowheadPolygons } from './getArrowheadPolygons';

export const getLineArrowheadPolygons = (node: TLineNode): TPoint[][] => {
  const dx = node.x2 - node.x1;
  const dy = node.y2 - node.y1;
  const length = Math.hypot(dx, dy);

  if (length !== 0) {
    const direction: TPoint = { x: dx / length, y: dy / length };
    const polygons: TPoint[][] = [];

    if (node.endPoint === 'arrow') {
      polygons.push(...getArrowheadPolygons({ x: node.x2, y: node.y2 }, direction, ARROWHEAD_LENGTH, ARROWHEAD_STROKE_WIDTH));
    }

    if (node.startPoint === 'arrow') {
      polygons.push(
        ...getArrowheadPolygons({ x: node.x1, y: node.y1 }, { x: -direction.x, y: -direction.y }, ARROWHEAD_LENGTH, ARROWHEAD_STROKE_WIDTH),
      );
    }

    return polygons;
  }

  return [];
};
