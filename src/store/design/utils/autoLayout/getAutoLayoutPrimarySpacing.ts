// types
import { AutoSpacing } from 'types/design/enums';

// utils
import { getDistributedGap } from './getDistributedGap';

export type TAutoLayoutPrimarySpacing = { edgeOffset: number; gap: number };

export const getAutoLayoutPrimarySpacing = (
  availableSpace: number,
  itemsTotalSize: number,
  itemCount: number,
  mode: AutoSpacing,
): TAutoLayoutPrimarySpacing => {
  if (itemCount !== 0) {
    const leftover = Math.max(0, availableSpace - itemsTotalSize);

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
        return { edgeOffset: 0, gap: getDistributedGap(availableSpace, itemsTotalSize, itemCount) };
    }
  }

  return { edgeOffset: 0, gap: 0 };
};
