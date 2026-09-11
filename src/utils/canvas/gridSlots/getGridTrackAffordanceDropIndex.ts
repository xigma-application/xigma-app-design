// utils
import { getGridTrackOffset } from './getGridTrackOffset';

export const getGridTrackAffordanceDropIndex = (sizes: number[], gap: number, pointerOffset: number): number =>
  sizes.filter((size, index) => pointerOffset > getGridTrackOffset(sizes, gap, index) + size / 2).length;
