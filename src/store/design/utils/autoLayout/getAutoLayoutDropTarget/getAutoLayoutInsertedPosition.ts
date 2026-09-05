// types
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TPoint } from 'types/canvas';

export const getAutoLayoutInsertedPosition = (
  isHorizontal: boolean,
  itemSpacing: number,
  index: number,
  realPositions: TAutoLayoutChildPosition[],
  children: TAutoLayoutChildSize[],
  simulatedPosition: TPoint,
): TPoint => {
  if (index === 0) {
    return simulatedPosition;
  }

  const previousPosition = realPositions[index - 1];
  const previousSize = children[index - 1];
  const previousPrimaryStart = isHorizontal ? previousPosition.x : previousPosition.y;
  const previousPrimarySize = isHorizontal ? previousSize.width : previousSize.height;
  const primary = previousPrimaryStart + previousPrimarySize + itemSpacing / 2;

  return isHorizontal ? { x: primary, y: simulatedPosition.y } : { x: simulatedPosition.x, y: primary };
};
