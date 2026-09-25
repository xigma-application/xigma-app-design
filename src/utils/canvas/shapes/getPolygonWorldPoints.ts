// types
import { TPoint } from 'types/canvas';
import { TPolygonNode } from 'types/design/types';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getPolygonShapePoints } from './getPolygonShapePoints';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getPolygonWorldPoints = (node: TPolygonNode): TPoint[] => {
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };

  return getPolygonShapePoints(node, node.sides, node.cornerRadius ?? 0).map((point) =>
    rotatePoint(flipPoint(point, center, node.flipX, node.flipY), center, node.rotation),
  );
};
