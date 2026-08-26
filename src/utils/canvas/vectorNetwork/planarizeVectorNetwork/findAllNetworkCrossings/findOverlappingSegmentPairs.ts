// types
import { TIndexedBoundingBox } from './types';

// utils
import { boundingBoxesOverlap } from './boundingBoxesOverlap';
import { getCellKeys } from './getCellKeys';
import { getCellSize } from './getCellSize';

export const findOverlappingSegmentPairs = (boundingBoxes: TIndexedBoundingBox[]): [number, number][] => {
  const cellSize = getCellSize(boundingBoxes);
  const boxesByCellKey = new Map<string, TIndexedBoundingBox[]>();
  const seenPairKeys = new Set<string>();
  const pairs: [number, number][] = [];

  boundingBoxes.forEach((box) => {
    getCellKeys(box, cellSize).forEach((key) => {
      const bucket = boxesByCellKey.get(key) ?? [];

      bucket.push(box);
      boxesByCellKey.set(key, bucket);
    });
  });

  boxesByCellKey.forEach((bucket) => {
    for (let i = 0; i < bucket.length; i += 1) {
      for (let j = i + 1; j < bucket.length; j += 1) {
        const a = bucket[i];
        const b = bucket[j];
        const pairKey = `${a.index}:${b.index}`;

        if (!seenPairKeys.has(pairKey) && boundingBoxesOverlap(a, b)) {
          seenPairKeys.add(pairKey);
          pairs.push([a.index, b.index]);
        }
      }
    }
  });

  return pairs;
};
