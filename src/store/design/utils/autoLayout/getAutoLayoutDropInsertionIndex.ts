// types
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from './getAutoLayoutChildPositions';

const getInsertionThreshold = (start: number, size: number, positionIndex: number, originalIndex: number | null): number => {
  switch (true) {
    case originalIndex === null:
      return start + size / 2;
    case originalIndex !== null && positionIndex < originalIndex:
      return start + size;
    default:
      return start;
  }
};

export const getAutoLayoutDropInsertionIndex = (
  isHorizontal: boolean,
  cursorPrimary: number,
  positions: TAutoLayoutChildPosition[],
  children: TAutoLayoutChildSize[],
  originalIndex: number | null,
): number =>
  positions.reduce((count, position, positionIndex) => {
    const size = isHorizontal ? children[positionIndex].width : children[positionIndex].height;
    const start = isHorizontal ? position.x : position.y;
    const threshold = getInsertionThreshold(start, size, positionIndex, originalIndex);

    return cursorPrimary < threshold ? count : count + 1;
  }, 0);
