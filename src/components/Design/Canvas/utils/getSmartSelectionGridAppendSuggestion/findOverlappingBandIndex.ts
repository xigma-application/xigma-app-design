// utils
import { getOverlap } from '../getDistanceGuides/getOverlap';

export const findOverlappingBandIndex = (starts: number[], sizes: number[], rangeStart: number, rangeEnd: number): number =>
  starts.findIndex((start, index) => getOverlap(start, start + sizes[index], rangeStart, rangeEnd) > 0);
