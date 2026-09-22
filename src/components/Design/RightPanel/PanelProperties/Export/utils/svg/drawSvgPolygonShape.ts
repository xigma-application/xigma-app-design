// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TPolygonNode } from 'types/design/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { flipPoint } from 'utils/math/flipPoint';
import { getPolygonShapePoints } from 'utils/canvas/shapes/getPolygonShapePoints';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawSvgPolygonShape = (elements: string[], node: TPolygonNode, opacity: number, bounds: TDraftRect): void => {
  if (node.fill) {
    const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const toDesign = (point: TPoint): TPoint => rotatePoint(flipPoint(point, center, node.flipX, node.flipY), center, node.rotation);

    drawSvgPolygons(elements, [getPolygonShapePoints(node, node.sides, node.cornerRadius ?? 0).map(toDesign)], node.fill, opacity, bounds);
  }
};
