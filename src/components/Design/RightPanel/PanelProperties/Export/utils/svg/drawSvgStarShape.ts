// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TStarNode } from 'types/design/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { flipPoint } from 'utils/math/flipPoint';
import { getStarShapePoints } from 'utils/canvas/shapes/getStarShapePoints';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawSvgStarShape = (elements: string[], node: TStarNode, opacity: number, bounds: TDraftRect): void => {
  if (node.fill) {
    const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const toDesign = (point: TPoint): TPoint => rotatePoint(flipPoint(point, center, node.flipX, node.flipY), center, node.rotation);

    drawSvgPolygons(
      elements,
      [getStarShapePoints(node, node.points, node.ratio, node.cornerRadius ?? 0).map(toDesign)],
      node.fill,
      opacity,
      bounds,
    );
  }
};
