// types
import { TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TGridCellPlacement } from '../types';

export const getGridContentMaxPerTrack = (
  placements: TGridCellPlacement[],
  sizes: TAutoLayoutChildSize[],
  trackCount: number,
  isColumnAxis: boolean,
): number[] => {
  const maxes = new Array<number>(trackCount).fill(0);

  placements.forEach((placement, index) => {
    const span = isColumnAxis ? placement.columnSpan : placement.rowSpan;

    if (span === 1) {
      const start = isColumnAxis ? placement.columnStart : placement.rowStart;
      const size = isColumnAxis ? sizes[index].width : sizes[index].height;

      maxes[start] = Math.max(maxes[start], size);
    }
  });

  return maxes;
};
