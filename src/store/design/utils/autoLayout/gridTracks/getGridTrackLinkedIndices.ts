// types
import { TGridTrackChild } from './types';

export const getGridTrackLinkedIndices = (children: TGridTrackChild[], trackCount: number): number[][] => {
  const groups = Array.from({ length: trackCount }, (_unused, index) => [index]);

  children.forEach((child) => {
    if (child.anchorIndex !== undefined) {
      const anchor = child.anchorIndex;
      const span = Math.max(Math.round(child.span), 1);

      if (span > 1) {
        const indices = Array.from({ length: span }, (_unused, offset) => anchor + offset).filter((index) => index < trackCount);

        indices.forEach((index) => {
          groups[index] = indices;
        });
      }
    }
  });

  return groups;
};
