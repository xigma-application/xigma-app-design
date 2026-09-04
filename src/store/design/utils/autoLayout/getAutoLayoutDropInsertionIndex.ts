// types
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from './getAutoLayoutChildPositions';

export const getAutoLayoutDropInsertionIndex = (
  isHorizontal: boolean,
  cursorPrimary: number,
  positions: TAutoLayoutChildPosition[],
  children: TAutoLayoutChildSize[],
): number =>
  positions.reduce((count, position, positionIndex) => {
    const size = isHorizontal ? children[positionIndex].width : children[positionIndex].height;
    const midpoint = (isHorizontal ? position.x : position.y) + size / 2;

    return cursorPrimary < midpoint ? count : count + 1;
  }, 0);
