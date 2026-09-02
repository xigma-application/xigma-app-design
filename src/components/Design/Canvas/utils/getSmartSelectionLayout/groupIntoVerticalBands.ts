// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getOverlap } from '../getDistanceGuides/getOverlap';

export const groupIntoVerticalBands = (nodes: TSmartSelectionNode[]): TSmartSelectionNode[][] => {
  const sorted = [...nodes].sort((a, b) => a.bounds.x - b.bounds.x);
  const bands: TSmartSelectionNode[][] = [];
  const extents: { left: number; right: number }[] = [];

  sorted.forEach((node) => {
    const left = node.bounds.x;
    const right = node.bounds.x + node.bounds.width;
    const bandIndex = extents.findIndex((extent) => getOverlap(extent.left, extent.right, left, right) > 0);

    if (bandIndex === -1) {
      bands.push([node]);
      extents.push({ left, right });
    } else {
      bands[bandIndex].push(node);
      extents[bandIndex] = { left: Math.min(extents[bandIndex].left, left), right: Math.max(extents[bandIndex].right, right) };
    }
  });

  return bands.map((band) => [...band].sort((a, b) => a.bounds.y - b.bounds.y));
};
