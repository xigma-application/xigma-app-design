// types
import { TBoundingBox } from './types';

export const getCellSize = (boundingBoxes: TBoundingBox[]): number => {
  if (boundingBoxes.length === 0) {
    return 1;
  }

  const extent = boundingBoxes.reduce(
    (accumulator, box) => ({
      maxX: Math.max(accumulator.maxX, box.maxX),
      maxY: Math.max(accumulator.maxY, box.maxY),
      minX: Math.min(accumulator.minX, box.minX),
      minY: Math.min(accumulator.minY, box.minY),
    }),
    { maxX: boundingBoxes[0].maxX, maxY: boundingBoxes[0].maxY, minX: boundingBoxes[0].minX, minY: boundingBoxes[0].minY },
  );
  const area = Math.max(1, (extent.maxX - extent.minX) * (extent.maxY - extent.minY));

  return Math.max(1, Math.sqrt(area / boundingBoxes.length));
};
