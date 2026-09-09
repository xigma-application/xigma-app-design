// types
import { AutoSpacing, LayoutVersion } from 'types/design/enums';

// utils
import { getDistributedGap } from './getDistributedGap';

export type TAutoLayoutPrimarySpacing = { edgeOffset: number; gap: number };

export const getAutoLayoutPrimarySpacing = (
  availableSpace: number,
  itemsTotalSize: number,
  itemCount: number,
  mode: AutoSpacing,
  layoutVersion: LayoutVersion = LayoutVersion.updated,
): TAutoLayoutPrimarySpacing => {
  if (itemCount !== 0) {
    const clampToZero = layoutVersion !== LayoutVersion.legacy;
    const rawLeftover = availableSpace - itemsTotalSize;
    const leftover = clampToZero ? Math.max(0, rawLeftover) : rawLeftover;

    switch (mode) {
      case AutoSpacing.around: {
        const unit = leftover / itemCount;
        return { edgeOffset: unit / 2, gap: unit };
      }
      case AutoSpacing.evenly: {
        const unit = leftover / (itemCount + 1);
        return { edgeOffset: unit, gap: unit };
      }
      default:
        return { edgeOffset: 0, gap: getDistributedGap(availableSpace, itemsTotalSize, itemCount, clampToZero) };
    }
  }

  return { edgeOffset: 0, gap: 0 };
};
