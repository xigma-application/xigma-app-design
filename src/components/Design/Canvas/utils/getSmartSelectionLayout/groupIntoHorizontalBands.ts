// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getOverlap } from '../getDistanceGuides/getOverlap';

export const groupIntoHorizontalBands = (nodes: TSmartSelectionNode[]): TSmartSelectionNode[][] => {
  const sorted = [...nodes].sort((a, b) => a.bounds.y - b.bounds.y);
  const bands: TSmartSelectionNode[][] = [];
  const extents: { bottom: number; top: number }[] = [];

  sorted.forEach((node) => {
    const top = node.bounds.y;
    const bottom = node.bounds.y + node.bounds.height;
    const bandIndex = extents.findIndex((extent) => getOverlap(extent.top, extent.bottom, top, bottom) > 0);

    if (bandIndex === -1) {
      bands.push([node]);
      extents.push({ bottom, top });
    } else {
      bands[bandIndex].push(node);
      extents[bandIndex] = { bottom: Math.max(extents[bandIndex].bottom, bottom), top: Math.min(extents[bandIndex].top, top) };
    }
  });

  return bands.map((band) => [...band].sort((a, b) => a.bounds.x - b.bounds.x));
};
