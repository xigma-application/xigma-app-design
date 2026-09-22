// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { flipPoint } from 'utils/math/flipPoint';
import { getEllipseFillPoints } from 'utils/canvas/shapes/getEllipseFillPoints';
import { getEllipseStrokeRingPoints } from 'utils/canvas/shapes/getEllipseStrokeRingPoints';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawSvgEllipseShape = (elements: string[], node: TEllipseNode, opacity: number, bounds: TDraftRect): void => {
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const toDesign = (point: TPoint): TPoint =>
    rotatePoint(flipPoint(point, center, node.flipX ?? false, node.flipY ?? false), center, node.rotation);

  if (node.fill) {
    drawSvgPolygons(elements, [getEllipseFillPoints(node).map(toDesign)], node.fill, opacity, bounds);
  }

  if (node.strokeColor && node.strokeWidth) {
    drawSvgPolygons(
      elements,
      getEllipseStrokeRingPoints(node, node.strokeWidth).map((polygon) => polygon.map(toDesign)),
      node.strokeColor,
      opacity,
      bounds,
    );
  }
};
