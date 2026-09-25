// types
import { TEllipseShape, getEllipseFillPoints } from './getEllipseFillPoints';
import { TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getEllipseWorldPoints = (node: TEllipseShape, flipX: boolean, flipY: boolean, rotation: number): TPoint[] => {
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  return getEllipseFillPoints(node).map((point) => rotatePoint(flipPoint(point, center, flipX, flipY), center, rotation));
};
