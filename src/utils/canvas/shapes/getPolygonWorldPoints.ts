// types
import { TPoint } from 'types/canvas';
import { NodeType } from 'types/design/enums';
import { TPolygonNode, TStarNode } from 'types/design/types';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getPolygonShapePoints } from './getPolygonShapePoints';
import { getStarShapePoints } from './getStarShapePoints';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getPolygonWorldPoints = (node: TPolygonNode | TStarNode): TPoint[] => {
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };

  const points =
    node.type === NodeType.star
      ? getStarShapePoints(node, node.points, node.ratio, node.cornerRadius ?? 0)
      : getPolygonShapePoints(node, node.sides, node.cornerRadius ?? 0);

  return points.map((point) => rotatePoint(flipPoint(point, center, node.flipX, node.flipY), center, node.rotation));
};
