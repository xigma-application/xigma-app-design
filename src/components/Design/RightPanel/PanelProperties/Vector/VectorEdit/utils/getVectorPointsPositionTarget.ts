// types
import { TPoint } from 'types/canvas';
import { TVectorPointsPosition } from './getVectorPointsPosition';

// utils
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';

export const getVectorPointsPositionTarget = (position: TVectorPointsPosition, axis: 'x' | 'y', value: number): TPoint => {
  const local = { ...position, [axis]: value };
  const target = position.parent ? getNodeAbsoluteFromParentPosition(local, position.parent) : local;

  return { x: target.x - position.origin.x, y: target.y - position.origin.y };
};
