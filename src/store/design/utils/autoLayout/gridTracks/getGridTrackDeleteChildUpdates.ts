// types
import { TGridTrackChild, TGridTrackChildDeleteUpdate } from './types';

export const getGridTrackDeleteChildUpdates = (children: TGridTrackChild[], removeIndex: number): TGridTrackChildDeleteUpdate[] => {
  const updates: TGridTrackChildDeleteUpdate[] = [];

  children.forEach((child) => {
    if (child.anchorIndex !== undefined) {
      const anchor = child.anchorIndex;
      const span = Math.max(Math.round(child.span), 1);

      if (removeIndex < anchor) {
        updates.push({ anchorIndex: anchor - 1, id: child.id, span });
      }

      if (removeIndex >= anchor) {
        if (removeIndex < anchor + span) {
          if (span > 1) {
            updates.push({ anchorIndex: anchor, id: child.id, span: span - 1 });
          }

          if (span === 1) {
            updates.push({ anchorIndex: undefined, id: child.id, span: undefined });
          }
        }
      }
    }
  });

  return updates;
};
