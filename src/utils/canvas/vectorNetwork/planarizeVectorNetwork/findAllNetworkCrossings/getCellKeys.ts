// types
import { TBoundingBox } from './types';

export const getCellKeys = (box: TBoundingBox, cellSize: number): string[] => {
  const minCellX = Math.floor(box.minX / cellSize);
  const maxCellX = Math.floor(box.maxX / cellSize);
  const minCellY = Math.floor(box.minY / cellSize);
  const maxCellY = Math.floor(box.maxY / cellSize);
  const keys: string[] = [];

  for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
    for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
      keys.push(`${cellX}:${cellY}`);
    }
  }

  return keys;
};
